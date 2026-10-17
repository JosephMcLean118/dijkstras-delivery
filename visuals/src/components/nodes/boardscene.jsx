import { useNodesState, useEdgesState, ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PizzaPlaceNode from './pizzaplacenode'; 
import HouseNode from './housenode';
import JunctionNode from './junctionnode'; // 1. Import the new node

// 2. Add it to your node types
const nodeTypes = {
  pizza: PizzaPlaceNode,
  house: HouseNode,
  junction: JunctionNode, 
};

// 3. Add the junction to your map
const initialNodes = [
  { id: 'start', type: 'pizza', position: { x: 50, y: 150 }, data: { label: "Luigi's Pizza" } },
  { id: 'j1', type: 'junction', position: { x: 300, y: 165 }, data: { label: 'Main St Split' } },
  { id: 'h1', type: 'house', position: { x: 500, y: 50 }, data: { label: 'Customer A' } },
  { id: 'h2', type: 'house', position: { x: 500, y: 250 }, data: { label: 'Customer B' } }
];

// 4. Route edges from Pizza -> Junction -> Houses
const initialEdges = [
  { id: 'road1', source: 'start', target: 'j1', label: '2 mins' },
  { id: 'road2', source: 'j1', target: 'h1', label: '3 mins' },
  { id: 'road3', source: 'j1', target: 'h2', label: '4 mins' }
];

export default function BoardScene() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

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
      </ReactFlow>
    </div>
  );
}

