# 🍕 Dijkstra's Delivery Service

**Delivering pizza and shortest-path knowledge, one node at a time!**

Dijkstra's Delivery Service is an interactive, retro-styled educational tool designed to teach beginners the fundamentals of **Dijkstra's Algorithm**. By transforming a complex computing science concept into a pizza delivery simulation, the project makes learning graph theory intuitive, visual, and fun.

![Retro Aesthetic](https://img.shields.io/badge/Style-Pixel%20Art-orange)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20React%20Flow-blue)
![Education](https://img.shields.io/badge/Purpose-Educational-green)

## 🕹️ Game Overview

The application puts the user in the shoes of a delivery driver. The goal is to find the most fuel-efficient path from **Luigi's Pizza** to various customer houses across a town map.

### Key Features

- **🎓 Interactive Tutorial**: A step-by-step guided experience that explains the "why" and "how" of Dijkstra's algorithm, detailing every decision the algorithm makes.
- **🏆 Practice Challenge**: A gamified test mode where users must predict which node the algorithm will visit next.
- **🗺️ Dynamic Map Visualization**: Built using **React Flow**, the map features custom-designed pixel nodes (Pizza Place, Junctions, Houses) and roads that visually highlight as they are processed.
- **⛽ Fuel & Time Management**: 
  - **Timer**: Tracks how fast you can solve the route.
  - **Fuel Tank**: Each road has a "weight" (time/fuel cost). If the shortest path exceeds the tank capacity, the delivery fails!
  - **Penalty System**: Incorrect answers in the practice mode add time penalties to your final score.
- **💾 Local High Scores**: Saves your best completion time to local storage.
- **🎵 Audio Experience**: Includes a "Pizza Theme" to enhance the retro arcade atmosphere.

## 🛠️ Tech Stack

- **Frontend**: [React.js](https://reactjs.org/)
- **Map Engine**: [@xyflow/react](https://reactflow.dev/) (React Flow) for the graph visualization and node/edge management.
- **Typography**: 
  - `Press Start 2P`: For that authentic 8-bit arcade feel.
  - `VT323`: For retro terminal-style body text.
  - `Inter`: For clean, readable UI elements.
- **Styling**: Custom CSS focusing on pixel-perfect borders, parchment textures, and "chunky" UI components.

## 📖 Educational Goal

The project aims to demystify the process of finding the shortest path in a weighted graph. It emphasizes three core concepts:
1. **Initialization**: Setting the starting node to 0 and all others to infinity.
2. **Greedy Selection**: Always picking the unvisited node with the smallest known distance.
3. **Edge Relaxation**: Updating the distance to neighboring nodes if a shorter path is found through the current node.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. Clone the repository:
```bash
   git clone https://github.com/yourusername/dijkstras-delivery-service.git
```
2. Install dependencies:
```bash
   npm install
```
3. Run the development server:
```bash
   npm run dev
```

## 🎨 Design Inspiration
The visual style is inspired by classic 8-bit and 16-bit RPGs, utilizing a "parchment and wood" UI palette to simulate a delivery map on a wooden table.

---
**Developed as an educational project to make computing science accessible and engaging.**
