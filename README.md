# GATE 2027 CS Interactive Mindmap

This project is an interactive, collapsible mindmap built using **HTML, CSS, and JavaScript (with D3.js)** to visualize the GATE 2027 Computer Science syllabus, exam structure, and preparation strategies.

## Features
- **Interactive Tree Layout**: Click on nodes to expand or collapse sub-topics.
- **Zoom & Pan Controls**: Use your mouse/trackpad to drag and zoom in/out of the canvas. On-screen controls (+, -, and Reset) are also provided.
- **Dynamic Styling**: A dark-themed, modern interface with smooth micro-animations on hover and interactions.
- **Organized Data**: Branches are color-coded to easily differentiate between Syllabus, Exam Structure, and Preparation Strategy.

## File Structure

The project consists of the following key files:

- [`index.html`](index.html)  
  The main entry point. It sets up the webpage structure, includes the Google Fonts (`Outfit`), imports the D3.js library, and links all the necessary local CSS and JS files.

- [`style.css`](style.css)  
  Contains all styling for the mindmap. It defines the color palette (using CSS variables), the dark mode aesthetics, hover animations for nodes, and the layout for zoom controls.

- [`data.js`](data.js)  
  Acts as the data source. It contains the `mindmapData` object, which is a hierarchical JSON-like structure representing the entire tree of information for GATE CS 2027. If you want to edit or add new topics, you update this file.

- [`script.js`](script.js)  
  The core logic using D3.js. It takes the data from `data.js` and transforms it into the visual SVG tree layout. This script handles:
  - Constructing the node hierarchy.
  - Applying color logic inherited from main branches.
  - Setting up node spacing (horizontal and vertical gaps).
  - Managing the expand/collapse interactions and smooth transitions.
  - Adding zoom and pan behaviors.

## How to Run

Since this is a simple static front-end project, you don't need a build step or local server to view it. 
Simply **double-click on `index.html`** to open it in your default web browser and start exploring the mindmap.
