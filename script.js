// Set dimensions and margins for the diagram
const container = document.getElementById('mindmap-container');
const width = container.clientWidth;
const height = container.clientHeight;
const margin = {top: 20, right: 120, bottom: 20, left: 120};

// Create SVG and Zoom behavior
const zoom = d3.zoom()
    .scaleExtent([0.1, 3])
    .on("zoom", (event) => {
        svgGroup.attr("transform", event.transform);
    });

const svg = d3.select("#mindmap-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);

// A group for all tree elements
const svgGroup = svg.append("g");

// Center the initial view based on root node
const initialTransform = d3.zoomIdentity.translate(margin.left, height / 2).scale(0.8);
svg.call(zoom.transform, initialTransform);

// Color scale for different branches
const colorScale = d3.scaleOrdinal()
    .domain(["GATE CS 2027 Syllabus", "Exam Structure & Details", "Preparation Strategy"])
    .range(["#3b82f6", "#10b981", "#8b5cf6"]); // Blue, Emerald, Purple

let i = 0;
const duration = 750;
let root;

// Declares a tree layout and assigns the size
const treemap = d3.tree().nodeSize([60, 350]); 
// nodeSize vs size: nodeSize allows tree to expand infinitely instead of squeezing into fixed space.

// Assigns parent, children, height, depth
root = d3.hierarchy(mindmapData, (d) => d.children);
root.x0 = 0;
root.y0 = 0;

// Inherit colors to children based on the main branches
function assignColors(node, color) {
    if (node.depth === 1) {
        node.color = colorScale(node.data.name);
    } else if (node.depth > 1) {
        node.color = color;
    } else {
        node.color = "#ec4899"; // Root color (Pink)
    }
    
    if (node.children) {
        node.children.forEach(child => assignColors(child, node.color));
    }
    if (node._children) {
        node._children.forEach(child => assignColors(child, node.color));
    }
}
assignColors(root, null);


// Collapse after the second level (Syllabus subjects)
root.children.forEach(collapse);

function collapse(d) {
    if(d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

update(root);

// Controls
d3.select("#zoom-in").on("click", () => {
    svg.transition().duration(300).call(zoom.scaleBy, 1.3);
});

d3.select("#zoom-out").on("click", () => {
    svg.transition().duration(300).call(zoom.scaleBy, 1 / 1.3);
});

d3.select("#reset-zoom").on("click", () => {
    svg.transition().duration(750).call(zoom.transform, initialTransform);
});


function update(source) {
    // Assigns the x and y position for the nodes
    const treeData = treemap(root);

    // Compute the new tree layout.
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach((d) => { d.y = d.depth * 350; }); // Distance between levels

    // ****************** Nodes section ***************************

    // Update the nodes...
    const node = svgGroup.selectAll('g.node')
        .data(nodes, (d) => d.id || (d.id = ++i));

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", (d) => `translate(${source.y0},${source.x0})`)
        .on('click', click);

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", d => d._children ? d.color : "#1e293b")
        .style("stroke", d => d.color);

    // Add labels for the nodes
    const textEnter = nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", (d) => d.children || d._children ? -13 : 13)
        .attr("text-anchor", (d) => d.children || d._children ? "end" : "start")
        .text((d) => d.data.name)
        .style("fill-opacity", 1e-6);

    // Apply link styles and click handler for nodes with URLs
    textEnter.filter(d => d.data.url)
        .style("fill", "#60a5fa") // blue link color
        .style("text-decoration", "underline")
        .style("cursor", "pointer")
        .style("pointer-events", "auto") // Override CSS pointer-events: none
        .on("click", (event, d) => {
            window.open(d.data.url, '_blank');
            event.stopPropagation(); // Prevent node from collapsing/expanding
        });

    // UPDATE
    const nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
        .duration(duration)
        .attr("transform", (d) => `translate(${d.y},${d.x})`);

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
        .attr('r', 8)
        .style("fill", d => d._children ? d.color : "#1e293b")
        .style("stroke", d => d.color)
        .attr('cursor', 'pointer');

    // Update the text styling
    nodeUpdate.select('text')
        .style("fill-opacity", 1)
        .style("fill", d => d.data.url ? "#60a5fa" : "")
        .style("text-decoration", d => d.data.url ? "underline" : "")
        .style("pointer-events", d => d.data.url ? "auto" : "none");

    // Remove any exiting nodes
    const nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", (d) => `translate(${source.y},${source.x})`)
        .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
        .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
        .style("fill-opacity", 1e-6);

    // ****************** links section ***************************

    // Update the links...
    const link = svgGroup.selectAll('path.link')
        .data(links, (d) => d.id);

    // Enter any new links at the parent's previous position.
    const linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', (d) => {
            const o = {x: source.x0, y: source.y0};
            return diagonal(o, o);
        })
        .style("stroke", d => d.color || "#334155");

    // UPDATE
    const linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(duration)
        .attr('d', (d) => diagonal(d, d.parent));

    // Remove any exiting links
    const linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', (d) => {
            const o = {x: source.x, y: source.y};
            return diagonal(o, o);
        })
        .remove();

    // Store the old positions for transition.
    nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
        const path = `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`;
        return path;
    }

    // Toggle children on click.
    function click(event, d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        
        update(d);
    }
}
