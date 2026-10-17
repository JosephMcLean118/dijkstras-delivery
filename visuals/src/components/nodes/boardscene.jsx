import { useNodesState, useEdgesState, ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// 1. Import your custom node components
import PizzaPlaceNode from './pizzaplacenode'; 
import HouseNode from './housenode';

// 2. Define nodeTypes outside the component to avoid unnecessary re-renders
const nodeTypes = {
  pizza: PizzaPlaceNode,
  house: HouseNode,
};

// 3. Define the starting map elements
const initialNodes = [
  { 
    id: 'start', 
    type: 'pizza', 
    position: { x: 100, y: 150 }, 
    data: { label: "Luigi's Pizza" } 
  },
  { 
    id: 'h1', 
    type: 'house', 
    position: { x: 450, y: 150 }, 
    data: { label: 'Hungry Customer', distance: '∞' } 
  }
];

const initialEdges = [
  { id: 'e1', source: 'start', target: 'h1', label: '5 mins' }
];

export default function BoardScene() {
  // 4. Hook nodes and edges into state so they can be dragged and updated
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

