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

// Track the sequence, but also remember which exact node got which image
let sequenceIndex = 0;
const assignedHouses = {};

// We extract the 'id' prop, which React Flow automatically passes to all custom nodes
export default function HouseNode({ id, data }) {
  
  const [houseImage] = useState(() => {
    // If Strict Mode double-renders, just return the image this ID was already given
    if (assignedHouses[id]) {
      return assignedHouses[id];
    }

    // Otherwise, assign the next sequential image and increment the counter
    const image = houseOptions[sequenceIndex % houseOptions.length];
    assignedHouses[id] = image;
    sequenceIndex++;
    
    return image;
  });

  return (
    <div>
      <img 
        src={houseImage} 
        alt="House" 
        style={{
          width: '64px',
          height: '64px',
          imageRendering: 'pixelated', 
          marginBottom: '4px'
        }}
      />

      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="right" style={{ opacity: 0 }} />
    </div>
  );
}