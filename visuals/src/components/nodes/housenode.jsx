import { Handle, Position } from '@xyflow/react';

export default function HouseNode({ data }) {
  const isTarget = data.isTarget;
  return (
    <div style={{
      padding: '10px 14px',
      borderRadius: '10px',
      background: isTarget ? '#e8f8f5' : '#fdfefe',
      border: `2px solid ${isTarget ? '#27ae60' : '#bdc3c7'}`,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '20px' }}>HOUSE</div>
      <div>{data.label}</div>
      {data.distance !== undefined && (
        <small style={{ color: '#7f8c8d' }}>
          Dist: {data.distance === Infinity ? '∞' : `${data.distance}m`}
        </small>
      )}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}