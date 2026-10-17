 import { Handle, Position } from '@xyflow/react';
import { useState } from 'react';

import House from '../artwork/Houses/House.png';
import RedHouse from '../artwork/Houses/RedHouse.png';
import OrangeHouse from '../artwork/Houses/OrangeHouse.png';
import YellowHouse from '../artwork/Houses/YellowHouse.png';
import GreenHouse from '../artwork/Houses/GreenHouse.png';
import BlueHouse from '../artwork/Houses/BlueHouse.png';
import IndigoHouse from '../artwork/Houses/IndigoHouse.png';
import PurpleHouse from '../artwork/Houses/PurpleHouse.png';

// Array of all imported house assets
const houseOptions = [
  House, 
  RedHouse, 
  OrangeHouse, 
  YellowHouse, 
  GreenHouse, 
  BlueHouse, 
  IndigoHouse, 
  PurpleHouse
];

export default function HouseNode({ data }) {
  // useState with a function ensures it picks a random house ONCE on mount
  const [randomHouse] = useState(() => {
    const randomIndex = Math.floor(Math.random() * houseOptions.length);
    return houseOptions[randomIndex];
  });

  return (
    <div>
      <img 
        src={randomHouse} 
        alt="House" 
        style={{
          width: '64px',
          height: '64px',
          imageRendering: 'pixelated', // Keeps pixel art sharp
          marginBottom: '4px'
        }}
      />
      {data.distance !== null && data.distance !== undefined && (
        <div style={{ marginTop: '5px', fontSize: '12px', color: 'blue' }}>
          Distance: {data.distance}
        </div>
      )}

      {/* Give the house multiple target sockets */}
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Bottom} id="bottom" />
    </div>
  );
}