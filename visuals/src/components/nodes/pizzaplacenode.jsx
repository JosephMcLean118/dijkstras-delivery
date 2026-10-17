import { Handle, Position } from '@xyflow/react';
import PizzaShop from '../artwork/PizzaShop.png';

export default function PizzaNode({ data }) {
  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      <img 
        src={PizzaShop} 
        alt="Pizza Shop" 
        style={{
          width: '64px',
          height: '64px',
          imageRendering: 'pixelated',
          marginBottom: '4px'
        }}
      />

      {/* Target handle must have id="bottom" to match your initialEdges array */}
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
}