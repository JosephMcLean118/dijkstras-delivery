import { useNodesState, useEdgesState, ReactFlow, Background, Controls, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PizzaPlaceNode from './pizzaplacenode'; 
import HouseNode from './housenode';
import JunctionNode from './junctionnode'; 

// 1. Map your custom node types
const nodeTypes = {
  pizza: PizzaPlaceNode,
  house: HouseNode,
  junction: JunctionNode, 
};

// 2. Setup initial nodes with 'distance: null' so the UI knows to hide the distance label
const initialNodes = [
  { id: 'start', type: 'pizza', position: { x: 200, y: -300 }, data: { label: "Luigi's Pizza", distance: null } },
  { id: 'j1', type: 'junction', position: { x: 300, y: 165 }, data: { label: 'Main St Split', distance: null } },
  { id: 'h1', type: 'house', position: { x: 500, y: 50 }, data: { label: 'Customer A', distance: null } },
  { id: 'h2', type: 'house', position: { x: 500, y: 250 }, data: { label: 'Customer B', distance: null } }
];

// 3. Setup initial edges with hidden 'weight' data instead of visible labels
const initialEdges = [
  { id: 'road1', source: 'start', target: 'j1', data: { weight: 2 } },
  { id: 'road2', source: 'j1', target: 'h1', data: { weight: 3 } },
  { id: 'road3', source: 'j1', target: 'h2', data: { weight: 4 } }
];

export default function BoardScene() {
  // 4. State hooks (now including setNodes and setEdges)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const runAlgorithmStep = () => {
    // Reveal edge weights by grabbing the hidden data.weight and pushing it to the visible label
    setEdges((currentEdges) => 
      currentEdges.map((edge) => {
        return { ...edge, label: `${edge.data.weight} mins` };
      })
    );

    // Set the starting node distance to 0, and all others to Infinity
    setNodes((currentNodes) => 
      currentNodes.map((node) => {
        if (node.id === 'start') {
          return { ...node, data: { ...node.data, distance: 0 } };
        }
        return { ...node, data: { ...node.data, distance: '∞' } };
      })
    );
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        
        {/* 5. Add the UI Panel to trigger the algorithm */}
        <Panel position="top-left">
          <button 
            onClick={runAlgorithmStep}
            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Start Dijkstra
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}