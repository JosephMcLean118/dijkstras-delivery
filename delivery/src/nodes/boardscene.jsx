import { useState } from 'react';
import { useNodesState, useEdgesState, ReactFlow, Background, Controls, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PizzaPlaceNode from './pizzaplacenode'; 
import HouseNode from './housenode';
import JunctionNode from './junctionnode'; 

const nodeTypes = {
  pizza: PizzaPlaceNode,
  house: HouseNode,
  junction: JunctionNode, 
};

// Map Data
const initialNodes = [
  { id: 'start', type: 'pizza', position: { x: 379.5, y: -100 }, data: { label: "Luigi's Pizza", distance: null } },
  { id: 'j1', type: 'junction', position: { x: 400, y: 162.5 }, data: { label: 'Junction 1', distance: null } },
  { id: 'j2', type: 'junction', position: { x: 555, y: 162.5 }, data: { label: 'Junction 2', distance: null } },
  { id: 'h1', type: 'house', position: { x: 535, y: 50 }, data: { label: 'Cream House', distance: null } },
  { id: 'h2', type: 'house', position: { x: 700, y: 137 }, data: { label: 'Red house', distance: null } },
  { id: 'j3', type: 'junction', position: { x: 400, y: 412.5 }, data: { label: 'Junction 3', distance: null } },
  { id: 'h7', type: 'house', position: { x: 380, y: 550 }, data: { label: 'Orange House', distance: null } },
  { id: 'j4', type: 'junction', position: { x: 155, y: 412.5 }, data: { label: 'Junction 4', distance: null } },
  { id: 'h3', type: 'house', position: { x: 135, y: 250 }, data: { label: 'Yellow House', distance: null } },
  { id: 'h4', type: 'house', position: { x: 135, y: 550 }, data: { label: 'Green House', distance: null } },
  { id: 'j5', type: 'junction', position: { x: 555, y: 412.5 }, data: { label: 'Junction 5', distance: null } },
  { id: 'h5', type: 'house', position: { x: 535, y: 300 }, data: { label: 'Light Blue House', distance: null } },
  { id: 'h6', type: 'house', position: { x: 535, y: 550 }, data: { label: 'Dark Blue House', distance: null } },
  { id: 'j6', type: 'junction', position: { x: 855, y: 412.5 }, data: { label: 'Junction 6', distance: null } },
  { id: 'h8', type: 'house', position: { x: 835, y: 250 }, data: { label: 'Pink House', distance: null } },
];

const initialEdges = [
  { id: 'e-start-j1', source: 'start', sourceHandle: 'bottom', target: 'j1', targetHandle: 'top', type: 'step', data: { weight: 2 } },
  { id: 'e-j1-j2', source: 'j1', sourceHandle: 'right', target: 'j2', targetHandle: 'left', type: 'step', data: { weight: 4 } },
  { id: 'e-j1-j3', source: 'j1', sourceHandle: 'bottom', target: 'j3', targetHandle: 'top', type: 'step', data: { weight: 5 } },
  { id: 'e-j2-h1', source: 'j2', sourceHandle: 'top', target: 'h1', targetHandle: 'bottom', type: 'step', data: { weight: 1 } },
  { id: 'e-j2-h2', source: 'j2', sourceHandle: 'right', target: 'h2', targetHandle: 'left', type: 'step', data: { weight: 3 } },
  { id: 'e-j3-j4', source: 'j3', sourceHandle: 'left', target: 'j4', targetHandle: 'right', type: 'step', data: { weight: 6 } },
  { id: 'e-j3-j5', source: 'j3', sourceHandle: 'right', target: 'j5', targetHandle: 'left', type: 'step', data: { weight: 2 } },
  { id: 'e-j3-h7', source: 'j3', sourceHandle: 'bottom', target: 'h7', targetHandle: 'top', type: 'step', data: { weight: 4 } },
  { id: 'e-j4-h3', source: 'j4', sourceHandle: 'top', target: 'h3', targetHandle: 'bottom', type: 'step', data: { weight: 2 } },
  { id: 'e-j4-h4', source: 'j4', sourceHandle: 'bottom', target: 'h4', targetHandle: 'top', type: 'step', data: { weight: 3 } },
  { id: 'e-j5-h5', source: 'j5', sourceHandle: 'top', target: 'h5', targetHandle: 'bottom', type: 'step', data: { weight: 1 } },
  { id: 'e-j5-h6', source: 'j5', sourceHandle: 'bottom', target: 'h6', targetHandle: 'top', type: 'step', data: { weight: 5 } },
  { id: 'e-j5-j6', source: 'j5', sourceHandle: 'right', target: 'j6', targetHandle: 'left', type: 'step', data: { weight: 7 } },
  { id: 'e-j6-h8', source: 'j6', sourceHandle: 'top', target: 'h8', targetHandle: 'bottom', type: 'step', data: { weight: 2 } },
];

export default function BoardScene() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [quizFeedback, setQuizFeedback] = useState("");
  const [isQuizCorrect, setIsQuizCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const [algoState, setAlgoState] = useState({
    started: false,
    finished: false,
    distances: {},
    unvisited: [],
    visited: [],
    currentVisitingName: "",
    currentVisitingId: "",
    stepCount: 0,
    phase: 'idle',
    explanation: "",
    quizOptions: [],
    correctAnswer: null
  });

  const runNextStep = (overrideQuiz = false) => {
    if (algoState.finished) return;

    if (!algoState.started) {
      const initDistances = {};
      initialNodes.forEach(n => {
        initDistances[n.id] = n.id === 'start' ? 0 : Infinity;
      });

      setAlgoState({
        started: true,
        finished: false,
        distances: initDistances,
        unvisited: initialNodes.map(n => n.id),
        visited: [],
        currentVisitingName: "Initializing...",
        currentVisitingId: "start",
        stepCount: 0,
        phase: 'explaining',
        explanation: "Initialization: We begin at Luigi's Pizza. We set its distance to 0. All other nodes are temporarily set to Infinity (∞) because we haven't discovered routes to them yet."
      });

      setNodes(nds => nds.map(n => ({
        ...n,
        data: { ...n.data, distance: n.id === 'start' ? 0 : '∞' }
      })));
      setEdges(eds => eds.map(e => ({ 
        ...e, 
        label: `${e.data.weight} mins`,
        animated: false,
        style: { stroke: '#999', strokeWidth: 2 } 
      })));
      
      return;
    }

    let { distances, unvisited, visited } = algoState;
    
    let nextNodeId = null;
    let minDistance = Infinity;
    let reachableUnvisited = [];
    
    unvisited.forEach(id => {
      if (distances[id] < Infinity) {
        reachableUnvisited.push({ id, dist: distances[id] });
      }
      if (distances[id] < minDistance) {
        minDistance = distances[id];
        nextNodeId = id;
      }
    });

    if (!nextNodeId || minDistance === Infinity) {
      setAlgoState(prev => ({ 
        ...prev, 
        finished: true, 
        currentVisitingName: "Finished!", 
        currentVisitingId: prev.currentVisitingId, 
        phase: 'explaining',
        explanation: "Algorithm Complete! All reachable destinations have been mapped with their absolute shortest routes from the Pizza Place." 
      }));
      setNodes(nds => nds.map(n => ({ ...n, style: { ...n.style, boxShadow: 'none', border: 'none' } })));
      setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { stroke: '#999', strokeWidth: 2 } })));
      
      return;
    }

    if (unvisited.length <= 5 && !overrideQuiz && reachableUnvisited.length > 2) {
      setAlgoState(prev => ({
        ...prev,
        phase: 'quiz',
        quizOptions: reachableUnvisited,
        correctAnswer: nextNodeId
      }));
      setQuizFeedback("");
      setIsQuizCorrect(false);
      return;
    }

    const newDistances = { ...distances };
    const connectedEdges = edges.filter(e => e.source === nextNodeId);
    let edgeUpdatesLog = [];
    
    connectedEdges.forEach(edge => {
      const neighborId = edge.target;
      if (unvisited.includes(neighborId)) {
        const newDist = newDistances[nextNodeId] + edge.data.weight;
        
        if (newDist < newDistances[neighborId]) {
          const neighborName = nodes.find(n => n.id === neighborId).data.label;
          const oldDistText = newDistances[neighborId] === Infinity ? '∞' : newDistances[neighborId];
          edgeUpdatesLog.push(`${neighborName} (${oldDistText} ➔ ${newDist})`);
          
          newDistances[neighborId] = newDist;
        }
      }
    });

    const newUnvisited = unvisited.filter(id => id !== nextNodeId);
    const newVisited = [...visited, nextNodeId];
    const visitingNodeObj = nodes.find(n => n.id === nextNodeId);

    const reachableText = reachableUnvisited.map(n => `${nodes.find(x=>x.id===n.id).data.label} (${n.dist})`).join(', ');
    let explanationText = `Step ${algoState.stepCount + 1}\n\n`;
    explanationText += `• Candidate Nodes: ${reachableText}\n`;
    explanationText += `• Selection: We lock in ${visitingNodeObj.data.label} because it currently has the absolute lowest known distance (${minDistance}).\n`;
    
    if (edgeUpdatesLog.length > 0) {
      explanationText += `• Updates: Scanning roads leaving ${visitingNodeObj.data.label} revealed faster routes to: ${edgeUpdatesLog.join(', ')}.`;
    } else {
      explanationText += `• Updates: Scanning roads leaving ${visitingNodeObj.data.label} revealed no faster routes to any remaining unvisited neighbors.`;
    }

    setAlgoState({
      started: true,
      finished: newUnvisited.length === 0,
      distances: newDistances,
      unvisited: newUnvisited,
      visited: newVisited,
      currentVisitingName: visitingNodeObj.data.label,
      currentVisitingId: nextNodeId,
      stepCount: algoState.stepCount + 1,
      phase: 'explaining',
      explanation: explanationText
    });

    setNodes(nds => nds.map(n => {
      const isCurrent = n.id === nextNodeId;
      const isVisited = newVisited.includes(n.id);
      
      let displayDist = newDistances[n.id];
      if (displayDist === Infinity) displayDist = '∞';

      return {
        ...n,
        data: { ...n.data, distance: displayDist },
        style: {
          ...n.style,
          border: isCurrent ? '3px solid #ff0072' : isVisited ? '2px solid transparent' : 'none',
          boxShadow: isCurrent ? '0 0 15px #ff0072' : 'none',
          borderRadius: '5px',
          transition: 'all 0.3s ease'
        }
      };
    }));

    setEdges(eds => eds.map(e => {
      const isActive = e.source === nextNodeId && newUnvisited.includes(e.target);
      return {
        ...e,
        animated: isActive, 
        style: {
          ...e.style,
          stroke: isActive ? '#ff0000' : '#999', 
          strokeWidth: isActive ? 4 : 2,        
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease'
        }
      };
    }));
  };

  const topNodes = ['start', 'h1', 'h2', 'j1', 'j2'];
  const explanationPosition = topNodes.includes(algoState.currentVisitingId) ? 'bottom-center' : 'top-center';

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', backgroundColor: '#e0e0e0', overflowX: 'hidden', margin: 0, padding: 0, boxSizing: 'border-box' }}>
      
      <div style={{ width: '200px', backgroundColor: '#2c3e50', color: '#ecf0f1', padding: '15px', overflowY: 'auto', boxShadow: '2px 0 10px rgba(0,0,0,0.5)', zIndex: 10 }}>
        <h2 style={{ borderBottom: '2px solid #34495e', paddingBottom: '8px', margin: '0 0 10px 0', fontSize: '1.2em' }}>
          Customer Distances
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {nodes.filter(n => n.type === 'house').map(house => (
              <li key={house.id} style={{ margin: '6px 0', padding: '8px 12px', backgroundColor: '#34495e', borderRadius: '6px', borderLeft: house.id === algoState.currentVisitingName ? '4px solid #ff0072' : '4px solid transparent' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9em' }}>{house.data.label}</div>
                <div style={{ marginTop: '2px', color: '#bdc3c7', fontSize: '0.85em' }}>
                  Distance: {house.data.distance === null ? 'Unknown' : house.data.distance}
                </div>
              </li>
          ))}
        </ul>

        <h2 style={{ borderBottom: '2px solid #34495e', paddingBottom: '8px', margin: '25px 0 10px 0', fontSize: '1.2em' }}>Visited Set</h2>
        <div style={{ fontSize: '0.85em', color: '#bdc3c7', lineHeight: '1.5' }}>
          {algoState.visited.length === 0 ? 'No nodes visited yet.' : algoState.visited.map(id => nodes.find(n => n.id === id)?.data.label).join(' → ')}
        </div>
      </div>

      <div style={{ flexGrow: 0.85, position: 'relative', backgroundColor: 'white' }}>
        
        {algoState.phase === 'quiz' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', maxWidth: '550px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Algorithm Quiz Time!</h2>
              <p style={{ fontSize: '16px', marginBottom: '20px', color: '#333' }}>
                Based on the currently known distances on the map, which unvisited location should Dijkstra's Algorithm lock in and visit next? (See list on the right!)
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
                {algoState.quizOptions.map(opt => {
                  const nodeName = nodes.find(n => n.id === opt.id).data.label;
                  return (
                    <button
                      key={opt.id}
                      disabled={isQuizCorrect}
                      onClick={() => {
                        if (opt.id === algoState.correctAnswer) {
                          setQuizFeedback(`Correct! ${nodeName} is the closest unvisited node.`);
                          setIsQuizCorrect(true);
                          
                          setTimeout(() => {
                            runNextStep(true); 
                          }, 1500);
                        } else {
                          setQuizFeedback(`Not quite! ${nodeName} has a distance of ${opt.dist}. Dijkstra always picks the node with the absolute lowest number.`);
                          setIsQuizCorrect(false);
                        }
                      }}
                      style={{ 
                        padding: '12px 18px', 
                        background: '#3498db', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: isQuizCorrect ? 'default' : 'pointer', 
                        fontWeight: 'bold', 
                        fontSize: '15px',
                        opacity: isQuizCorrect ? 0.6 : 1
                      }}
                    >
                      {nodeName}
                    </button>
                  );
                })}
              </div>

              <div style={{ minHeight: '24px', color: isQuizCorrect ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                {quizFeedback}
              </div>
            </div>
          </div>
        )}

        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          panOnDrag={false}       
          zoomOnScroll={false}    
          zoomOnDoubleClick={false} 
          zoomOnPinch={false}
          fitView
        >
          {algoState.started && (
            <Panel position="top-left">
              <div style={{ 
                background: algoState.finished ? '#27ae60' : '#333', 
                color: 'white', 
                padding: '10px 20px', 
                borderRadius: '8px', 
                fontSize: '18px', 
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {algoState.finished ? "Algorithm Complete!" : `Currently Visiting: ${algoState.currentVisitingName}`}
              </div>
            </Panel>
          )}

          {/* Dynamic Explanation Panel */}
          {algoState.phase === 'explaining' && showExplanation && (
            <Panel position={explanationPosition} style={{ 
              marginBottom: explanationPosition === 'bottom-center' ? '20px' : '0', 
              marginTop: explanationPosition === 'top-center' ? '70px' : '0', 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'flex-start',
              paddingLeft: '20px',
              pointerEvents: 'none' 
            }}>
              <div style={{ 
                pointerEvents: 'auto',
                background: '#fffcd1', 
                border: '2px solid #f1c40f', 
                padding: '15px 25px', 
                borderRadius: '8px', 
                width: '80%',
                maxWidth: '600px', 
                whiteSpace: 'pre-wrap', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
                color: '#2c3e50', 
                fontSize: '15px', 
                lineHeight: '1.5'
              }}>
                <strong style={{ display: 'block', marginBottom: '10px' }}>Algorithm Log:</strong>
                {algoState.explanation}
              </div>
            </Panel>
          )}
          
          <Panel position="top-right" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', width: '200px' }}>
            <button 
              onClick={() => runNextStep(false)}
              disabled={algoState.finished || algoState.phase === 'quiz'}
              style={{ 
                width: '100%',
                padding: '12px 20px', 
                fontSize: '15px', 
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (algoState.finished || algoState.phase === 'quiz') ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold',
                opacity: (algoState.finished || algoState.phase === 'quiz') ? 0.5 : 1,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              {algoState.started ? 'Next Step' : 'Start Dijkstra'}
            </button>
            
            <button 
              onClick={() => setShowExplanation(!showExplanation)}
              disabled={!algoState.started}
              style={{ 
                width: '100%',
                padding: '10px 20px', 
                fontSize: '14px', 
                backgroundColor: showExplanation ? '#27ae60' : '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: !algoState.started ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold',
                opacity: !algoState.started ? 0.5 : 1,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              Explanation: {showExplanation ? 'ON' : 'OFF'}
            </button>
          </Panel>
        </ReactFlow>
      </div>

      <div style={{ width: '180px', backgroundColor: '#f8f9fa', color: '#2c3e50', padding: '15px', overflowY: 'auto', boxShadow: '-2px 0 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
        <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '8px', margin: '0 0 10px 0', fontSize: '1em' }}>All Distances</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {nodes.map(node => (
            <li key={node.id} style={{ margin: '4px 0', padding: '4px 0', fontSize: '0.75em', borderBottom: '1px solid #eee' }}>
              <strong>{node.data.label}:</strong> <span style={{ color: '#e74c3c' }}>{node.data.distance === null ? '?' : node.data.distance}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}