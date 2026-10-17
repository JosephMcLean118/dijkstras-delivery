import { Handle, Position } from '@xyflow/react';

export default function JunctionNode({ data }) {
  return (
    <div style={{ 
      width: '20px', 
      height: '20px', 
      backgroundColor: '#555', 
      borderRadius: '50%', // Makes it a circle
      border: '2px solid #222',
      position: 'relative'
    }}>
      {/* Handles on all sides. opacity: 0 hides the dot but keeps it functional */}
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      
      <div style={{ position: 'absolute', top: '25px', left: '-10px', fontSize: '10px', whiteSpace: 'nowrap' }}>
        {data.label}
      </div>
    </div>
  );
}