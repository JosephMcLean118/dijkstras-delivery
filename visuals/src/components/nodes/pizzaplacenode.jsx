import { Handle, Position } from '@xyflow/react';

export default function PizzaNode({ data }) {
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '12px',
      background: '#ffefd5',
      border: '3px solid #e74c3c',
      textAlign: 'center',
      fontWeight: 'bold',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '24px' }}>PIZZAPLACE</div>
      <div>{data.label || 'Pizza Shop'}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}