import { useState } from 'react';
import ReactFlow, { Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import HouseNode from './housenose.jsx';

// Import house assets
import House from '../artwork/Houses/House.png';
import RedHouse from '../artwork/Houses/RedHouse.png';
import OrangeHouse from '../artwork/Houses/OrangeHouse.png';
import YellowHouse from '../artwork/Houses/YellowHouse.png';
import GreenHouse from '../artwork/Houses/GreenHouse.png';
import BlueHouse from '../artwork/Houses/BlueHouse.png';
import IndigoHouse from '../artwork/Houses/IndigoHouse.png';
import PurpleHouse from '../artwork/Houses/PurpleHouse.png';

const houseOptions = [
  House, RedHouse, OrangeHouse, YellowHouse, 
  GreenHouse, BlueHouse, IndigoHouse, PurpleHouse
];

const nodeTypes = { house: HouseNode };

// Helper to generate initial nodes with guaranteed non-repeating random colors
const generateInitialNodes = () => {
  // Shuffle all 8 colors randomly
  const shuffled = [...houseOptions].sort(() => Math.random() - 0.5);

  return [
    { id: '1', type: 'house', position: { x: 0, y: 0 }, data: { label: 'Alpha', distance: 10, image: shuffled[0] } },
    { id: '2', type: 'house', position: { x: 200, y: 0 }, data: { label: 'Beta', distance: 25, image: shuffled[1] } },
    { id: '3', type: 'house', position: { x: 400, y: 0 }, data: { label: 'Gamma', distance: 5, image: shuffled[2] } },
  ];
};

export default function App() {
  const [nodes, setNodes] = useState(generateInitialNodes);
  const [edges, setEdges] = useState([]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}