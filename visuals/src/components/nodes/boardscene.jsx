import { useState } from 'react';
import { useNodesState, useEdgesState, ReactFlow, Background, Controls, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PizzaPlaceNode from './pizzaplacenode'; 
import HouseNode from './housenode';
import JunctionNode from './junctionnode'; 

const nodeTypes = {
  pizza: PizzaPlaceNode,
  house: HouseNode,
  junction: JunctionNode, 
};

// 1. Expanded Map: We've added a second junction and a third house
const initialNodes = [
  // THE START
  { id: 'start', type: 'pizza', position: { x: 379.5, y: -100 }, data: { label: "Luigi's Pizza", distance: null } },
  
  // FIRST JUNCTION
  { id: 'j1', type: 'junction', position: { x: 400, y: 162.5 }, data: { label: 'Junction 1', distance: null } },
  
  // RIGHT BRANCH (From J1)
  { id: 'j2', type: 'junction', position: { x: 555, y: 162.5 }, data: { label: 'Junction 2', distance: null } },
  { id: 'h1', type: 'house', position: { x: 535, y: 50 }, data: { label: 'Cream House', distance: null } },    // Above j2
  { id: 'h2', type: 'house', position: { x: 700, y: 137 }, data: { label: 'Red house', distance: null } },  // Below j2
  
  // DOWN BRANCH (From J1)
  { id: 'j3', type: 'junction', position: { x: 400, y: 412.5 }, data: { label: 'Junction 3', distance: null } },
  { id: 'h7', type: 'house', position: { x: 380, y: 550 }, data: { label: 'Orange House', distance: null } },  // Below j3
  
  // LEFT BRANCH (From J3)
  { id: 'j4', type: 'junction', position: { x: 155, y: 412.5 }, data: { label: 'Junction 4', distance: null } },
  { id: 'h3', type: 'house', position: { x: 135, y: 250 }, data: { label: 'Yellow House', distance: null } },  // Above j4
  { id: 'h4', type: 'house', position: { x: 135, y: 550 }, data: { label: 'Green House', distance: null } },  // Below j4
  
  // RIGHT BRANCH (From J3)
  { id: 'j5', type: 'junction', position: { x: 555, y: 412.5 }, data: { label: 'Junction 5', distance: null } },
  { id: 'h5', type: 'house', position: { x: 535, y: 300 }, data: { label: 'Light Blue House', distance: null } },  // Above j5
  { id: 'h6', type: 'house', position: { x: 535, y: 550 }, data: { label: 'Dark Blue House', distance: null } },  // Below j5
  
  // FAR RIGHT BRANCH (From J5)
  { id: 'j6', type: 'junction', position: { x: 855, y: 412.5 }, data: { label: 'Junction 6', distance: null } },
  { id: 'h8', type: 'house', position: { x: 835, y: 250 }, data: { label: 'Pink House', distance: null } },  // Above j6
];

const initialEdges = [
  // From Pizza Place
  { id: 'e-start-j1', source: 'start', sourceHandle: 'bottom', target: 'j1', targetHandle: 'top', type: 'step', data: { weight: 2 } },
  
  // From Junction 1
  { id: 'e-j1-j2', source: 'j1', sourceHandle: 'right', target: 'j2', targetHandle: 'left', type: 'step', data: { weight: 4 } },
  { id: 'e-j1-j3', source: 'j1', sourceHandle: 'bottom', target: 'j3', targetHandle: 'top', type: 'step', data: { weight: 5 } },
  
  // From Junction 2
  { id: 'e-j2-h1', source: 'j2', sourceHandle: 'top', target: 'h1', targetHandle: 'bottom', type: 'step', data: { weight: 1 } },
  { id: 'e-j2-h2', source: 'j2', sourceHandle: 'right', target: 'h2', targetHandle: 'left', type: 'step', data: { weight: 3 } },
  
  // From Junction 3
  { id: 'e-j3-j4', source: 'j3', sourceHandle: 'left', target: 'j4', targetHandle: 'right', type: 'step', data: { weight: 6 } },
  { id: 'e-j3-j5', source: 'j3', sourceHandle: 'right', target: 'j5', targetHandle: 'left', type: 'step', data: { weight: 2 } },
  { id: 'e-j3-h7', source: 'j3', sourceHandle: 'bottom', target: 'h7', targetHandle: 'top', type: 'step', data: { weight: 4 } },
  
  // From Junction 4
  { id: 'e-j4-h3', source: 'j4', sourceHandle: 'top', target: 'h3', targetHandle: 'bottom', type: 'step', data: { weight: 2 } },
  { id: 'e-j4-h4', source: 'j4', sourceHandle: 'bottom', target: 'h4', targetHandle: 'top', type: 'step', data: { weight: 3 } },
  
  // From Junction 5
  { id: 'e-j5-h5', source: 'j5', sourceHandle: 'top', target: 'h5', targetHandle: 'bottom', type: 'step', data: { weight: 1 } },
  { id: 'e-j5-h6', source: 'j5', sourceHandle: 'bottom', target: 'h6', targetHandle: 'top', type: 'step', data: { weight: 5 } },
  { id: 'e-j5-j6', source: 'j5', sourceHandle: 'right', target: 'j6', targetHandle: 'left', type: 'step', data: { weight: 7 } },
  
  // From Junction 6
  { id: 'e-j6-h8', source: 'j6', sourceHandle: 'top', target: 'h8', targetHandle: 'bottom', type: 'step', data: { weight: 2 } },
];

export default function BoardScene() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 3. Algorithm State: This tracks Dijkstra's "brain" between button clicks
  const [algoState, setAlgoState] = useState({
    started: false,
    finished: false,
    distances: {},
    unvisited: [],
    visited: [],
    currentVisitingName: ""
  });

  const runNextStep = () => {
    // STEP A: Initialization
    if (!algoState.started) {
      const initDistances = {};
      initialNodes.forEach(n => {
        initDistances[n.id] = n.id === 'start' ? 0 : Infinity;
      });

      setAlgoState({
        started: true,
        finished: false,
        distances: initDistances,
        unvisited: initialNodes.map(n => n.id),
        visited: [],
        currentVisitingName: "Initializing..."
      });

      // Reset all nodes and edges to default styles
      setNodes(nds => nds.map(n => ({
        ...n,
        data: { ...n.data, distance: n.id === 'start' ? 0 : '∞' }
      })));
      setEdges(eds => eds.map(e => ({ 
        ...e, 
        label: `${e.data.weight} mins`,
        animated: false,
        style: { stroke: '#999', strokeWidth: 2 } 
      })));
      return;
    }

    // STEP B: Run Algorithm Iteration
    let { distances, unvisited, visited } = algoState;
    
    let nextNodeId = null;
    let minDistance = Infinity;
    
    unvisited.forEach(id => {
      if (distances[id] < minDistance) {
        minDistance = distances[id];
        nextNodeId = id;
      }
    });

    // If finished
    if (!nextNodeId || minDistance === Infinity) {
      setAlgoState(prev => ({ ...prev, finished: true, currentVisitingName: "Finished!" }));
      setNodes(nds => nds.map(n => ({ ...n, style: { ...n.style, boxShadow: 'none', border: 'none' } })));
      
      // Clear all red edge highlights when done
      setEdges(eds => eds.map(e => ({ 
        ...e, 
        animated: false, 
        style: { stroke: '#999', strokeWidth: 2 } 
      })));
      return;
    }

    const newDistances = { ...distances };
    const connectedEdges = edges.filter(e => e.source === nextNodeId);
    
    connectedEdges.forEach(edge => {
      const neighborId = edge.target;
      if (unvisited.includes(neighborId)) {
        const newDist = newDistances[nextNodeId] + edge.data.weight;
        if (newDist < newDistances[neighborId]) {
          newDistances[neighborId] = newDist;
        }
      }
    });

    const newUnvisited = unvisited.filter(id => id !== nextNodeId);
    const newVisited = [...visited, nextNodeId];
    const visitingNodeObj = nodes.find(n => n.id === nextNodeId);

    setAlgoState({
      started: true,
      finished: newUnvisited.length === 0,
      distances: newDistances,
      unvisited: newUnvisited,
      visited: newVisited,
      currentVisitingName: visitingNodeObj.data.label
    });

    setNodes(nds => nds.map(n => {
      const isCurrent = n.id === nextNodeId;
      const isVisited = newVisited.includes(n.id);
      
      let displayDist = newDistances[n.id];
      if (displayDist === Infinity) displayDist = '∞';

      return {
        ...n,
        data: { ...n.data, distance: displayDist },
        style: {
          ...n.style,
          border: isCurrent ? '3px solid #ff0072' : isVisited ? '2px solid transparent' : 'none',
          boxShadow: isCurrent ? '0 0 15px #ff0072' : 'none',
          borderRadius: '5px',
          transition: 'all 0.3s ease'
        }
      };
    }));

    // Highlight the edges currently being checked
    setEdges(eds => eds.map(e => {
      // An edge is active if it leaves the current node and points to an unvisited node
      const isActive = e.source === nextNodeId && newUnvisited.includes(e.target);
      
      return {
        ...e,
        animated: isActive, // Native React Flow prop that adds moving dots to the line
        style: {
          ...e.style,
          stroke: isActive ? '#ff0000' : '#999', // Bright red if active, grey otherwise
          strokeWidth: isActive ? 4 : 2,         // Thicker line when active
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease'
        }
      };
    }));
  };

  return (
    // Change to a Flex container to put the sidebar and map side-by-side
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#e0e0e0' }}>
      
      {/* LEFT SIDEBAR: Delivery Distances */}
      <div style={{ 
        width: '200px', 
        backgroundColor: '#2c3e50', 
        color: '#ecf0f1', 
        padding: '15px', // Reduced from 20px
        overflowY: 'auto', 
        boxShadow: '2px 0 10px rgba(0,0,0,0.5)', 
        zIndex: 10 
      }}>
        <h2 style={{ 
          borderBottom: '2px solid #34495e', 
          paddingBottom: '8px', 
          margin: '0 0 10px 0', // Reduced bottom margin
          fontSize: '1.2em'     // Slightly smaller header
        }}>
          Customer Distances
        </h2>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {nodes
            .filter(n => n.type === 'house') 
            .map(house => (
              <li key={house.id} style={{ 
                margin: '6px 0',      // Reduced from 15px
                padding: '8px 12px',  // Reduced from 15px
                backgroundColor: '#34495e', 
                borderRadius: '6px',
                borderLeft: house.id === algoState.currentVisitingName ? '4px solid #ff0072' : '4px solid transparent'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9em' }}>{house.data.label}</div> {/* Reduced from 1.1em */}
                <div style={{ marginTop: '2px', color: '#bdc3c7', fontSize: '0.85em' }}>
                  Distance: {house.data.distance === null ? 'Unknown' : house.data.distance}
                </div>
              </li>
          ))}
        </ul>
      </div>

      {/* RIGHT CANVAS: React Flow Map */}
      <div style={{ flexGrow: 0.6, position: 'relative', backgroundColor: 'white' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          panOnDrag={false}       
          zoomOnScroll={false}    
          zoomOnDoubleClick={false} 
          fitView
        >

          {/* Top Status Banner */}
          {algoState.started && (
            <Panel position="top-center">
              <div style={{ 
                background: algoState.finished ? '#27ae60' : '#333', 
                color: 'white', 
                padding: '10px 20px', 
                borderRadius: '8px', 
                fontSize: '18px', 
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {algoState.finished ? "Algorithm Complete!" : `Currently Visiting: ${algoState.currentVisitingName}`}
              </div>
            </Panel>
          )}
          
          {/* Controls Panel */}
          <Panel position="top-right">
            <button 
              onClick={runNextStep}
              disabled={algoState.finished}
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px', 
                cursor: algoState.finished ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold',
                opacity: algoState.finished ? 0.5 : 1
              }}
            >
              {algoState.started ? 'Next Step' : 'Start Dijkstra'}
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}