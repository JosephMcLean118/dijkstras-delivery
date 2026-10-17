import { Handle, Position } from '@xyflow/react';

export default function HouseNode({ data }) {
  return (
    <div style={{ padding: '10px', border: '2px solid #333', background: '#fff', borderRadius: '5px' }}>
      <div>HOUSE {data.label}</div>
      {data.distance !== null && (
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