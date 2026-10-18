import { useState, useMemo } from 'react';
import {
  useNodesState,
  useEdgesState,
  ReactFlow,
  Panel,
  EdgeLabelRenderer,
  getSmoothStepPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@fontsource/press-start-2p';
import '@fontsource/vt323';

import PizzaPlaceNode from './pizzaplacenode';
import HouseNode from './housenode';
import JunctionNode from './junctionnode';

/* ------------------------------------------------------------------ */
/*  Look and feel                                                      */
/* ------------------------------------------------------------------ */

// Change this to resize the whole board (e.g. '80vh', '700px')
const BOARD_HEIGHT = '100vh';

const INK = '#3b2a1a';       // dark brown outline used on every pixel border
const PARCHMENT = '#fdf1c7'; // signs and cards
const HIGHLIGHT = '#ff4d6d'; // the node / road being processed
const GOLD = '#ffd166';      // the final delivery route
const FUEL_TANK = 20;        // 1 fuel unit per minute of road

// A 32px grass tile drawn with 2px "pixels", scaled 3x so the pixels look chunky
const GRASS_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' shape-rendering='crispEdges'>
<rect width='32' height='32' fill='#62b04c'/>
<rect x='4' y='6' width='2' height='2' fill='#55a041'/>
<rect x='20' y='4' width='2' height='2' fill='#72c05a'/>
<rect x='12' y='16' width='2' height='2' fill='#55a041'/>
<rect x='26' y='20' width='2' height='2' fill='#72c05a'/>
<rect x='6' y='26' width='2' height='2' fill='#72c05a'/>
<rect x='16' y='28' width='2' height='2' fill='#55a041'/>
<rect x='28' y='10' width='2' height='2' fill='#55a041'/>
<rect x='14' y='6' width='2' height='2' fill='#72c05a'/>
</svg>`;
const GRASS = `url("data:image/svg+xml,${encodeURIComponent(GRASS_SVG)}")`;

const WOOD = {
  backgroundColor: '#7a4b24',
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 4px, transparent 4px, transparent 12px)',
};

const pixelCard = {
  background: PARCHMENT,
  color: INK,
  border: `4px solid ${INK}`,
  boxShadow: `4px 4px 0 ${INK}`,
};

const headingFont = { fontFamily: "'Press Start 2P', monospace" };
const bodyFont = { fontFamily: "'VT323', monospace" };

const styles = `
.px-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  line-height: 1.4;
  padding: 12px 14px;
  background: #e8553d;
  color: #fff;
  border: 4px solid ${INK};
  box-shadow: 4px 4px 0 ${INK};
  cursor: pointer;
  image-rendering: pixelated;
}
.px-btn:hover:not(:disabled) { background: #ff6a50; }
.px-btn:active:not(:disabled) { transform: translate(4px, 4px); box-shadow: 0 0 0 ${INK}; }
.px-btn:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
.px-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.px-btn.green { background: #3fa34d; }
.px-btn.green:hover:not(:disabled) { background: #4fb85e; }
.px-btn.grey { background: #8d8d99; }
.px-btn.grey:hover:not(:disabled) { background: #a2a2ae; }
.px-btn.blue { background: #3d7fe8; }
.px-btn.blue:hover:not(:disabled) { background: #5a95f2; }

.road-badge {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  background: ${PARCHMENT};
  color: ${INK};
  border: 3px solid ${INK};
  padding: 4px 5px;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.35);
  white-space: nowrap;
  pointer-events: none;
}

.road-flow { animation: roadflow 0.6s linear infinite; }
.road-badge.on-path { background: #ffd166; }
.px-pick { cursor: pointer; }
.px-pick:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
@keyframes roadflow { to { stroke-dashoffset: -18; } }

.pz-board .react-flow__node { image-rendering: pixelated; }

@media (prefers-reduced-motion: reduce) {
  .road-flow { animation: none; }
}
`;

/* ------------------------------------------------------------------ */
/*  Custom road edge: dark kerb, grey asphalt, dashed yellow centre   */
/* ------------------------------------------------------------------ */

function RoadEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0, // sharp corners keep the pixel look
  });
  const active = data?.active;
  const onPath = data?.onPath;

  return (
    <>
      <path d={path} fill="none" stroke="#2a2a33" strokeWidth={26} strokeLinecap="square" strokeLinejoin="miter" />
      <path
        d={path}
        fill="none"
        stroke={onPath ? '#f0a81c' : active ? '#8a8a99' : '#6e6e7c'}
        strokeWidth={20}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d={path}
        fill="none"
        stroke={onPath ? '#ffffff' : active ? HIGHLIGHT : '#f5d442'}
        strokeWidth={3}
        strokeDasharray="10 8"
        className={active || onPath ? 'road-flow' : undefined}
      />
      {data?.showLabel && (
        <EdgeLabelRenderer>
          <div
            className={`nodrag nopan road-badge${onPath ? ' on-path' : ''}`}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {data.weight} min
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative pixel tree (not part of the algorithm)                  */
/* ------------------------------------------------------------------ */

function TreeNode({ data }) {
  const size = data.size || 40;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect x="6" y="15" width="4" height="1" fill="rgba(0,0,0,0.25)" />
      <rect x="7" y="11" width="2" height="4" fill="#6b4423" />
      <rect x="5" y="1" width="6" height="2" fill="#2f8f3a" />
      <rect x="3" y="3" width="10" height="3" fill="#2f8f3a" />
      <rect x="2" y="6" width="12" height="4" fill="#2f8f3a" />
      <rect x="4" y="10" width="8" height="1" fill="#2f8f3a" />
      <rect x="9" y="7" width="5" height="3" fill="#1f6b2a" />
      <rect x="7" y="10" width="5" height="1" fill="#1f6b2a" />
      <rect x="5" y="2" width="2" height="2" fill="#4cc35a" />
      <rect x="4" y="6" width="2" height="2" fill="#4cc35a" />
    </svg>
  );
}

const nodeTypes = {
  pizza: PizzaPlaceNode,
  house: HouseNode,
  junction: JunctionNode,
  tree: TreeNode,
};

const edgeTypes = { road: RoadEdge };

/* ------------------------------------------------------------------ */
/*  Map data                                                           */
/* ------------------------------------------------------------------ */

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

// [x, y, size] - placed in the gaps between roads and houses
const decorNodes = [
  [250, 30, 44], [200, 110, 36], [320, 90, 40], [640, -20, 44], [730, 30, 36],
  [820, 100, 40], [270, 300, 44], [330, 250, 36], [690, 290, 44], [760, 350, 36],
  [260, 500, 40], [300, 560, 36], [700, 500, 44], [790, 540, 36], [930, 330, 40],
].map(([x, y, size], i) => ({
  id: `tree-${i}`,
  type: 'tree',
  position: { x, y },
  data: { size },
  draggable: false,
  selectable: false,
  focusable: false,
  connectable: false,
  style: { pointerEvents: 'none' },
}));

const road = (id, source, sourceHandle, target, targetHandle, weight) => ({
  id,
  source,
  sourceHandle,
  target,
  targetHandle,
  type: 'road',
  data: { weight, showLabel: false, active: false },
});

const initialEdges = [
  road('e-start-j1', 'start', 'bottom', 'j1', 'top', 2),
  road('e-j1-j2', 'j1', 'right', 'j2', 'left', 4),
  road('e-j1-j3', 'j1', 'bottom', 'j3', 'top', 5),
  road('e-j2-h1', 'j2', 'top', 'h1', 'bottom', 1),
  road('e-j2-h2', 'j2', 'right', 'h2', 'left', 3),
  road('e-j3-j4', 'j3', 'left', 'j4', 'right', 6),
  road('e-j3-j5', 'j3', 'right', 'j5', 'left', 2),
  road('e-j3-h7', 'j3', 'bottom', 'h7', 'top', 4),
  road('e-j4-h3', 'j4', 'top', 'h3', 'bottom', 2),
  road('e-j4-h4', 'j4', 'bottom', 'h4', 'top', 3),
  road('e-j5-h5', 'j5', 'top', 'h5', 'bottom', 1),
  road('e-j5-h6', 'j5', 'bottom', 'h6', 'top', 5),
  road('e-j5-j6', 'j5', 'right', 'j6', 'left', 7),
  road('e-j6-h8', 'j6', 'top', 'h8', 'bottom', 2),
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BoardScene() {
  // Trees come first so they are drawn underneath everything else
  const [nodes, setNodes, onNodesChange] = useNodesState([...decorNodes, ...initialNodes]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [quizFeedback, setQuizFeedback] = useState('');
  const [isQuizCorrect, setIsQuizCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [peekMap, setPeekMap] = useState(false); // hides the quiz so the map can be inspected

  const [algoState, setAlgoState] = useState({
    started: false,
    finished: false,
    distances: {},
    unvisited: [],
    visited: [],
    currentVisitingName: '',
    currentVisitingId: '',
    stepCount: 0,
    phase: 'idle',
    explanation: '',
    quizOptions: [],
    correctAnswer: null,
    correctDistance: null,
    prev: {}, // prev[x] = the node we came from to reach x on its shortest route
  });

  const [targetId, setTargetId] = useState('h8');

  // Walk back from the target to the pizza place once the target has been locked in
  const pathIds = useMemo(() => {
    if (!algoState.visited.includes(targetId)) return [];
    const ids = [];
    let cur = targetId;
    while (cur) {
      ids.unshift(cur);
      cur = algoState.prev[cur];
    }
    return ids;
  }, [algoState.visited, algoState.prev, targetId]);

  const routeFound = pathIds.length > 1;

  const pathEdges = useMemo(() => {
    const list = [];
    for (let i = 0; i < pathIds.length - 1; i++) {
      const edge = edges.find((e) => e.source === pathIds[i] && e.target === pathIds[i + 1]);
      if (edge) list.push(edge);
    }
    return list;
  }, [pathIds, edges]);

  const pathEdgeIds = useMemo(() => new Set(pathEdges.map((e) => e.id)), [pathEdges]);
  const pathNodeIds = useMemo(() => new Set(pathIds), [pathIds]);

  const displayNodes = useMemo(
    () =>
      nodes.map((n) => {
        if (n.type === 'tree') return n;
        const onPath = pathNodeIds.has(n.id);
        const isTarget = n.id === targetId;
        if (!onPath && !isTarget) return n;
        return {
          ...n,
          style: {
            ...n.style,
            ...(onPath && n.id !== algoState.currentVisitingId
              ? { border: `4px solid ${GOLD}`, boxShadow: '4px 4px 0 rgba(0,0,0,0.35)' }
              : {}),
            ...(isTarget ? { outline: '3px dashed #fff', outlineOffset: '3px' } : {}),
          },
        };
      }),
    [nodes, pathNodeIds, targetId, algoState.currentVisitingId]
  );

  const displayEdges = useMemo(
    () => edges.map((e) => (pathEdgeIds.has(e.id) ? { ...e, data: { ...e.data, onPath: true } } : e)),
    [edges, pathEdgeIds]
  );

  const labelOf = (id) => nodes.find((n) => n.id === id)?.data.label;
  const legWeights = pathEdges.map((e) => e.data.weight);
  const usedFuel = routeFound ? algoState.distances[targetId] : 0;
  const fuelLeft = Math.max(0, FUEL_TANK - usedFuel);
  const fuelPct = (fuelLeft / FUEL_TANK) * 100;
  const fuelColor = fuelPct > 50 ? '#3fa34d' : fuelPct > 25 ? '#f2b705' : '#e8553d';

  const setRoads = (patch) =>
    setEdges((eds) => eds.map((e) => ({ ...e, data: { ...e.data, ...patch(e) } })));

  const runNextStep = (overrideQuiz = false) => {
    if (algoState.finished) return;

    // Click 1: initialise
    if (!algoState.started) {
      const initDistances = {};
      initialNodes.forEach((n) => {
        initDistances[n.id] = n.id === 'start' ? 0 : Infinity;
      });

      setAlgoState({
        started: true,
        finished: false,
        distances: initDistances,
        unvisited: initialNodes.map((n) => n.id),
        visited: [],
        currentVisitingName: 'Initializing...',
        currentVisitingId: 'start',
        stepCount: 0,
        phase: 'explaining',
        explanation:
          "Initialization: We begin at Luigi's Pizza. We set its distance to 0. All other nodes are temporarily set to Infinity (∞) because we haven't discovered routes to them yet.",
        quizOptions: [],
        correctAnswer: null,
        correctDistance: null,
        prev: {},
      });

      setNodes((nds) =>
        nds.map((n) =>
          n.type === 'tree' ? n : { ...n, data: { ...n.data, distance: n.id === 'start' ? 0 : '∞' } }
        )
      );
      setRoads(() => ({ showLabel: true, active: false }));
      return;
    }

    let { distances, unvisited, visited } = algoState;

    let nextNodeId = null;
    let minDistance = Infinity;
    const reachableUnvisited = [];

    unvisited.forEach((id) => {
      if (distances[id] < Infinity) {
        reachableUnvisited.push({ id, dist: distances[id] });
      }
      if (distances[id] < minDistance) {
        minDistance = distances[id];
        nextNodeId = id;
      }
    });

    // Nothing reachable left: finished
    if (!nextNodeId || minDistance === Infinity) {
      setAlgoState((prev) => ({
        ...prev,
        finished: true,
        currentVisitingName: 'Finished!',
        phase: 'explaining',
        explanation:
          'Algorithm Complete! All reachable destinations have been mapped with their absolute shortest routes from the Pizza Place.',
      }));
      setNodes((nds) =>
        nds.map((n) => (n.type === 'tree' ? n : { ...n, style: { ...n.style, boxShadow: 'none', border: 'none' } }))
      );
      setRoads(() => ({ active: false }));
      return;
    }

    // Quiz on the 4th and 5th from last decisions
    if ((unvisited.length === 4 || unvisited.length === 5) && !overrideQuiz && reachableUnvisited.length > 1) {
      setAlgoState((prev) => ({
        ...prev,
        phase: 'quiz',
        quizOptions: reachableUnvisited,
        correctAnswer: nextNodeId,
        correctDistance: minDistance,
      }));
      setQuizFeedback('');
      setIsQuizCorrect(false);
      setPeekMap(false);
      return;
    }

    // Relax every road leaving the chosen node
    const newDistances = { ...distances };
    const newPrev = { ...algoState.prev };
    const connectedEdges = edges.filter((e) => e.source === nextNodeId);
    const edgeUpdatesLog = [];

    connectedEdges.forEach((edge) => {
      const neighborId = edge.target;
      if (unvisited.includes(neighborId)) {
        const newDist = newDistances[nextNodeId] + edge.data.weight;

        if (newDist < newDistances[neighborId]) {
          const neighborName = nodes.find((n) => n.id === neighborId).data.label;
          const oldDistText = newDistances[neighborId] === Infinity ? '∞' : newDistances[neighborId];
          edgeUpdatesLog.push(`${neighborName} (${oldDistText} ➔ ${newDist})`);
          newDistances[neighborId] = newDist;
          newPrev[neighborId] = nextNodeId;
        }
      }
    });

    const newUnvisited = unvisited.filter((id) => id !== nextNodeId);
    const newVisited = [...visited, nextNodeId];
    const visitingNodeObj = nodes.find((n) => n.id === nextNodeId);

    const reachableText = reachableUnvisited
      .map((n) => `${nodes.find((x) => x.id === n.id).data.label} (${n.dist})`)
      .join(', ');
    let explanationText = `Step ${algoState.stepCount + 1}\n\n`;
    explanationText += `• Candidate Nodes: ${reachableText}\n`;
    explanationText += `• Selection: We lock in ${visitingNodeObj.data.label} because it currently has the absolute lowest known distance (${minDistance}).\n`;

    if (edgeUpdatesLog.length > 0) {
      explanationText += `• Updates: Scanning roads leaving ${visitingNodeObj.data.label} revealed faster routes to: ${edgeUpdatesLog.join(', ')}.`;
    } else {
      explanationText += `• Updates: Scanning roads leaving ${visitingNodeObj.data.label} revealed no faster routes to any remaining unvisited neighbors.`;
    }

    if (nextNodeId === targetId) {
      explanationText += `\n• Target reached: the shortest route to ${visitingNodeObj.data.label} is locked in at ${minDistance} min. Follow the gold road on the map.`;
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
      explanation: explanationText,
      prev: newPrev,
    });

    setNodes((nds) =>
      nds.map((n) => {
        if (n.type === 'tree') return n;

        const isCurrent = n.id === nextNodeId;
        let displayDist = newDistances[n.id];
        if (displayDist === Infinity) displayDist = '∞';

        return {
          ...n,
          data: { ...n.data, distance: displayDist },
          style: {
            ...n.style,
            border: isCurrent ? `4px solid ${HIGHLIGHT}` : 'none',
            boxShadow: isCurrent ? '4px 4px 0 rgba(0,0,0,0.35)' : 'none',
            borderRadius: 0,
          },
        };
      })
    );

    setRoads((e) => ({ active: e.source === nextNodeId && newUnvisited.includes(e.target) }));
  };

  const topNodes = ['start', 'h1', 'h2', 'j1', 'j2'];
  const explanationPosition = topNodes.includes(algoState.currentVisitingId) ? 'bottom-center' : 'top-center';

  const listNodes = nodes.filter((n) => n.type !== 'tree');

  return (
    <div
      className="pz-board"
      style={{
        display: 'flex',
        width: '100%',
        height: BOARD_HEIGHT,
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        border: `4px solid ${INK}`,
        backgroundColor: '#62b04c',
      }}
    >
      <style>{styles}</style>

      {/* LEFT SIGN: customers */}
      <div
        style={{
          ...WOOD,
          ...bodyFont,
          width: '200px',
          flexShrink: 0,
          color: PARCHMENT,
          padding: '14px',
          overflowY: 'auto',
          borderRight: `4px solid ${INK}`,
          zIndex: 10,
        }}
      >
        <h2 style={{ ...headingFont, fontSize: '11px', lineHeight: 1.6, margin: '0 0 12px', textShadow: `2px 2px 0 ${INK}` }}>
          Customers
        </h2>
        <div style={{ fontSize: '17px', lineHeight: 1.1, opacity: 0.85, margin: '-4px 0 8px' }}>
          Click a house to choose where to deliver.
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {nodes
            .filter((n) => n.type === 'house')
            .map((house) => {
              const isCurrent = house.id === algoState.currentVisitingId;
              const isTarget = house.id === targetId;
              return (
                <li
                  key={house.id}
                  className="px-pick"
                  role="button"
                  tabIndex={0}
                  aria-pressed={isTarget}
                  onClick={() => setTargetId(house.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setTargetId(house.id);
                    }
                  }}
                  style={{
                    ...pixelCard,
                    border: `3px solid ${isCurrent ? HIGHLIGHT : isTarget ? '#e8a317' : INK}`,
                    boxShadow: `3px 3px 0 ${INK}`,
                    background: isCurrent ? '#ffd6e0' : isTarget ? '#fff0b8' : PARCHMENT,
                    margin: '10px 0',
                    padding: '6px 8px',
                  }}
                >
                  <div style={{ fontSize: '20px', lineHeight: 1.1 }}>{house.data.label}</div>
                  <div style={{ fontSize: '18px', opacity: 0.75 }}>
                    Distance: {house.data.distance === null ? 'Unknown' : house.data.distance}
                  </div>
                  {isTarget && <div style={{ fontSize: '17px', color: '#a35a00' }}>Deliver here</div>}
                </li>
              );
            })}
        </ul>

        <h2 style={{ ...headingFont, fontSize: '11px', lineHeight: 1.6, margin: '24px 0 10px', textShadow: `2px 2px 0 ${INK}` }}>
          Visited
        </h2>
        <div style={{ fontSize: '19px', lineHeight: 1.25 }}>
          {algoState.visited.length === 0
            ? 'No stops yet.'
            : algoState.visited.map((id) => nodes.find((n) => n.id === id)?.data.label).join(' → ')}
        </div>
      </div>

      {/* TOWN MAP */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          position: 'relative',
          backgroundColor: '#62b04c',
          backgroundImage: GRASS,
          backgroundSize: '96px 96px',
          imageRendering: 'pixelated',
        }}
      >
        {algoState.phase === 'quiz' && peekMap && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
            }}
          >
            <button className="px-btn" onClick={() => setPeekMap(false)}>
              Back to question
            </button>
          </div>
        )}

        {algoState.phase === 'quiz' && !peekMap && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(30, 20, 10, 0.7)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div style={{ ...pixelCard, ...bodyFont, padding: '24px', maxWidth: '560px', textAlign: 'center' }}>
              <h2 style={{ ...headingFont, fontSize: '13px', lineHeight: 1.6, margin: '0 0 14px' }}>Quiz time!</h2>
              <p style={{ fontSize: '22px', lineHeight: 1.2, margin: '0 0 18px' }}>
                Based on the distances known so far, which unvisited location should Dijkstra's Algorithm visit next?
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
                {algoState.quizOptions.map((opt) => {
                  const nodeName = nodes.find((n) => n.id === opt.id).data.label;
                  return (
                    <button
                      key={opt.id}
                      className="px-btn blue"
                      disabled={isQuizCorrect}
                      onClick={() => {
                        if (opt.id === algoState.correctAnswer) {
                          setQuizFeedback(`Correct! ${nodeName} is the closest unvisited node.`);
                          setIsQuizCorrect(true);
                          setTimeout(() => runNextStep(true), 1500);
                        } else if (opt.dist === algoState.correctDistance) {
                          setQuizFeedback(
                            `Correct! ${nodeName} is tied for the lowest distance. We'll arbitrarily run with the other one for this step.`
                          );
                          setIsQuizCorrect(true);
                          setTimeout(() => runNextStep(true), 3000);
                        } else {
                          setQuizFeedback(
                            `Not quite! ${nodeName} has a distance of ${opt.dist}. Dijkstra always picks the node with the lowest number.`
                          );
                          setIsQuizCorrect(false);
                        }
                      }}
                    >
                      {nodeName}
                    </button>
                  );
                })}
              </div>

              <div style={{ minHeight: '52px', fontSize: '21px', lineHeight: 1.2, color: isQuizCorrect ? '#1f7a2e' : '#b3261e' }}>
                {quizFeedback}
              </div>

              <button className="px-btn grey" style={{ marginTop: '12px' }} onClick={() => setPeekMap(true)}>
                Look at the map
              </button>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          zoomOnPinch={false}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          style={{ background: 'transparent' }}
        >
          {algoState.started && (
            <Panel position="top-left">
              <div
                style={{
                  ...pixelCard,
                  ...headingFont,
                  background: algoState.finished ? '#8be28f' : PARCHMENT,
                  padding: '10px 12px',
                  fontSize: '10px',
                  lineHeight: 1.5,
                }}
              >
                {algoState.finished ? 'All routes found!' : `Visiting: ${algoState.currentVisitingName}`}
              </div>
            </Panel>
          )}

          {algoState.phase === 'explaining' && showExplanation && (
            <Panel
              position={explanationPosition}
              style={{
                marginBottom: explanationPosition === 'bottom-center' ? '20px' : '0',
                marginTop: explanationPosition === 'top-center' ? '70px' : '0',
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-start',
                paddingLeft: '20px',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  ...pixelCard,
                  ...bodyFont,
                  pointerEvents: 'auto',
                  background: '#fff3b0',
                  padding: '14px 20px',
                  width: '80%',
                  maxWidth: '600px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '20px',
                  lineHeight: 1.2,
                }}
              >
                <strong style={{ ...headingFont, display: 'block', fontSize: '10px', marginBottom: '10px', fontWeight: 'normal' }}>
                  Algorithm log
                </strong>
                {algoState.explanation}
              </div>
            </Panel>
          )}

          <Panel
            position="top-right"
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch', width: '200px' }}
          >
            <button
              className="px-btn"
              onClick={() => runNextStep(false)}
              disabled={algoState.finished || algoState.phase === 'quiz'}
            >
              {algoState.started ? 'Next step' : 'Start Dijkstra'}
            </button>

            <button
              className={`px-btn ${showExplanation ? 'green' : 'grey'}`}
              onClick={() => setShowExplanation(!showExplanation)}
              disabled={!algoState.started}
            >
              Explain: {showExplanation ? 'on' : 'off'}
            </button>
          </Panel>
        </ReactFlow>
      </div>

      {/* RIGHT SIGN: all distances */}
      <div
        style={{
          ...WOOD,
          ...bodyFont,
          width: '220px',
          flexShrink: 0,
          color: PARCHMENT,
          padding: '14px',
          overflowY: 'auto',
          borderLeft: `4px solid ${INK}`,
          zIndex: 10,
        }}
      >
        <h3 style={{ ...headingFont, fontSize: '10px', lineHeight: 1.6, margin: '0 0 12px', textShadow: `2px 2px 0 ${INK}` }}>
          Delivery run
        </h3>
        <div style={{ ...pixelCard, border: `3px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`, padding: '8px 10px', marginBottom: '22px' }}>
          <div style={{ fontSize: '20px', lineHeight: 1.1 }}>Deliver to: {labelOf(targetId)}</div>
          <div style={{ fontSize: '17px', lineHeight: 1.15, opacity: 0.8, margin: '4px 0 10px' }}>
            {routeFound ? pathIds.map(labelOf).join(' → ') : 'Run the algorithm to find the shortest route.'}
          </div>

          <div style={{ ...headingFont, fontSize: '8px', marginBottom: '6px' }}>Fuel</div>
          <div style={{ position: 'relative', height: '22px', background: '#2a2a33', border: `3px solid ${INK}` }}>
            <div
              style={{
                height: '100%',
                width: `${fuelPct}%`,
                background: fuelColor,
                transition: 'width 1.4s steps(20, end)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent 0, transparent calc(5% - 2px), rgba(0,0,0,0.55) calc(5% - 2px), rgba(0,0,0,0.55) 5%)',
              }}
            />
          </div>
          <div style={{ ...headingFont, fontSize: '8px', display: 'flex', justifyContent: 'space-between', margin: '4px 0 10px' }}>
            <span>E</span>
            <span>F</span>
          </div>

          <div style={{ fontSize: '20px', lineHeight: 1.1 }}>Distance run: {routeFound ? `${usedFuel} min` : '-'}</div>
          <div style={{ fontSize: '18px', lineHeight: 1.1 }}>
            Fuel left: {fuelLeft} / {FUEL_TANK}
          </div>
          {routeFound && (
            <div style={{ fontSize: '17px', lineHeight: 1.1, opacity: 0.8, marginTop: '4px' }}>
              {legWeights.join(' + ')} = {usedFuel}
            </div>
          )}
          {routeFound && usedFuel > FUEL_TANK && (
            <div style={{ fontSize: '18px', color: '#b3261e', marginTop: '4px' }}>Not enough fuel for this route!</div>
          )}
        </div>

        <h3 style={{ ...headingFont, fontSize: '10px', lineHeight: 1.6, margin: '0 0 12px', textShadow: `2px 2px 0 ${INK}` }}>
          All distances
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {listNodes.map((node) => (
            <li
              key={node.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                padding: '3px 0',
                fontSize: '19px',
                lineHeight: 1.1,
                borderBottom: '2px dashed rgba(253, 241, 199, 0.35)',
              }}
            >
              <span>{node.data.label}</span>
              <span style={{ color: '#ffd166' }}>{node.data.distance === null ? '?' : node.data.distance}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
