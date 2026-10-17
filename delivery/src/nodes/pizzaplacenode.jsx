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
      
      {/* Node Label */}
      <div style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.7)', borderRadius: '4px', padding: '2px' }}>
        {data.label || 'Pizza Shop'}
      </div>

      {/* Algorithm Distance Display */}
      {data.distance !== null && data.distance !== undefined && (
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#d35400', fontWeight: 'bold' }}>
          Dist: {data.distance}
        </div>
      )}

      {/* Target handle must have id="bottom" to match your initialEdges array */}
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
}