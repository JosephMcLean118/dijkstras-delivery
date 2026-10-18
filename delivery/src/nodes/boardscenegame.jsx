import { useState, useMemo, useEffect, useRef } from 'react';
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
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

const BOARD_HEIGHT = '100vh';  // whole component height
const DOCK_HEIGHT = 240;       // height of the question panel under the map (px)
const WRONG_PENALTY = 5;       // seconds added to your time for each wrong answer
const FUEL_TANK = 20;          // 1 fuel unit per minute of road
const BEST_KEY = 'dijkstra-test-best-time';

const INK = '#3b2a1a';
const PARCHMENT = '#fdf1c7';
const HIGHLIGHT = '#ff4d6d';
const GOLD = '#ffd166';

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
.px-btn:disabled { cursor: not-allowed; }
.px-btn.green { background: #3fa34d; }
.px-btn.grey { background: #8d8d99; opacity: 0.6; }
.px-btn.blue { background: #3d7fe8; }
.px-btn.blue:hover:not(:disabled) { background: #5a95f2; }
.px-btn.blue:disabled:not(.grey):not(.green) { opacity: 0.6; }

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
.road-badge.on-path { background: ${GOLD}; }

.road-flow { animation: roadflow 0.6s linear infinite; }
@keyframes roadflow { to { stroke-dashoffset: -18; } }

.px-pick { cursor: pointer; }
.px-pick:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }

.pz-board .react-flow__node { image-rendering: pixelated; }

@media (prefers-reduced-motion: reduce) {
  .road-flow { animation: none; }
}
`;

/* ------------------------------------------------------------------ */
/*  Road edge and decorative tree                                      */
/* ------------------------------------------------------------------ */

function RoadEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
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

const TOTAL_QUESTIONS = initialNodes.length;
const labelById = Object.fromEntries(initialNodes.map((n) => [n.id, n.data.label]));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const formatTime = (secs) =>
  `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

const emptyAlgo = () => ({
  started: false,
  finished: false,
  distances: {},
  unvisited: [],
  visited: [],
  prev: {},
  stepCount: 0,
  currentVisitingName: '',
  currentVisitingId: '',
});

/**
 * Builds the question for the next step.
 *  - "next":   which unvisited location does Dijkstra visit next?
 *  - "update": after visiting a node, what is a neighbour's new distance?
 * Every second step uses an "update" question when the step improves a neighbour.
 */
function buildQuestion(state, edgeList) {
  const { distances, unvisited, visited, stepCount } = state;
  const reachable = unvisited.filter((id) => distances[id] < Infinity);
  if (reachable.length === 0) return null;

  const minDist = Math.min(...reachable.map((id) => distances[id]));
  const nextId = reachable.find((id) => distances[id] === minDist);

  const improvements = edgeList
    .filter((e) => e.source === nextId && unvisited.includes(e.target))
    .map((e) => ({
      id: e.target,
      weight: e.data.weight,
      oldDist: distances[e.target],
      newDist: distances[nextId] + e.data.weight,
    }))
    .filter((u) => u.newDist < u.oldDist);

  if (stepCount % 2 === 1 && improvements.length > 0) {
    const u = improvements[0];
    const here = distances[nextId];
    const oldText = u.oldDist === Infinity ? '∞' : `${u.oldDist} min`;
    const candidates = [
      u.newDist,
      u.weight,
      u.newDist + 1,
      u.newDist + 2,
      Math.max(1, u.newDist - 1),
      u.oldDist < Infinity ? u.oldDist : u.newDist + 3,
    ];
    const unique = [...new Set(candidates)].filter((n) => n > 0);
    const distractors = shuffle(unique.filter((n) => n !== u.newDist)).slice(0, 3);
    const options = shuffle([u.newDist, ...distractors]).map((n) => ({
      id: String(n),
      label: `${n} min`,
      correct: n === u.newDist,
      hint: "Not quite. Add the road's time to the distance you've already travelled to reach the current location.",
    }));

    return {
      kind: 'update',
      stepNodeId: nextId,
      prompt: `Dijkstra is now at ${labelById[nextId]}, ${here} min from the pizza place. The road to ${labelById[u.id]} takes ${u.weight} min, and its distance is currently ${oldText}. What is the distance to ${labelById[u.id]} after checking this road?`,
      explanation: `${here} + ${u.weight} = ${u.newDist}, which is shorter than ${u.oldDist === Infinity ? 'infinity' : u.oldDist}, so the distance is updated.`,
      options,
    };
  }

  const others = shuffle(reachable.filter((id) => distances[id] !== minDist));
  const unreachable = shuffle(unvisited.filter((id) => distances[id] === Infinity));
  const done = shuffle(visited);
  const picks = shuffle([nextId, ...[...others, ...unreachable, ...done].slice(0, 3)]);

  const options = picks.map((id) => {
    const correct = unvisited.includes(id) && distances[id] === minDist;
    let hint;
    if (visited.includes(id)) {
      hint = `${labelById[id]} has already been visited, so its distance is final.`;
    } else if (distances[id] === Infinity) {
      hint = `No road to ${labelById[id]} has been found yet, so its distance is still ∞.`;
    } else {
      hint = `${labelById[id]} is ${distances[id]} min away, but another unvisited location is closer.`;
    }
    return { id, label: labelById[id], correct, hint };
  });

  return {
    kind: 'next',
    stepNodeId: null,
    prompt:
      stepCount === 0
        ? 'Every run starts at the pizza place, where the distance is 0. Which location does Dijkstra visit first?'
        : 'Which unvisited location should Dijkstra visit next?',
    explanation:
      stepCount === 0
        ? 'We always begin at the pizza place, because it is the only location with a known distance.'
        : `${labelById[nextId]} has the lowest known distance (${minDist} min) of all the unvisited locations.`,
    options,
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PracticeScene() {
  const [nodes, setNodes, onNodesChange] = useNodesState([...decorNodes, ...initialNodes]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [algoState, setAlgoState] = useState(emptyAlgo());
  const [targetId, setTargetId] = useState('h8');

  const [question, setQuestion] = useState(null);
  const [wrongIds, setWrongIds] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [locked, setLocked] = useState(false);

  const [seconds, setSeconds] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [stats, setStats] = useState({ asked: 0, firstTry: 0 });
  const [bestTime, setBestTime] = useState(() => {
    try {
      const saved = localStorage.getItem(BEST_KEY);
      return saved === null ? null : Number(saved);
    } catch {
      return null;
    }
  });
  const [newBest, setNewBest] = useState(false);

  const timeoutRef = useRef(null);

  /* ---------- timer: runs while a question is open, pauses while the answer is explained ---------- */

  const timerOn = algoState.started && !algoState.finished && !locked;
  useEffect(() => {
    if (!timerOn) return undefined;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerOn]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const displaySeconds = seconds + mistakes * WRONG_PENALTY;

  useEffect(() => {
    if (!algoState.finished) return;
    const total = seconds + mistakes * WRONG_PENALTY;
    const isBest = bestTime === null || total < bestTime;
    setNewBest(isBest);
    if (isBest) {
      setBestTime(total);
      try {
        localStorage.setItem(BEST_KEY, String(total));
      } catch {
        /* storage unavailable: ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algoState.finished]);

  /* ---------- route to the chosen house + fuel ---------- */

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

  const legWeights = pathEdges.map((e) => e.data.weight);
  const usedFuel = routeFound ? algoState.distances[targetId] : 0;
  const fuelLeft = Math.max(0, FUEL_TANK - usedFuel);
  const fuelPct = (fuelLeft / FUEL_TANK) * 100;
  const fuelColor = fuelPct > 50 ? '#3fa34d' : fuelPct > 25 ? '#f2b705' : '#e8553d';

  /* ---------- algorithm ---------- */

  const setRoads = (patch) =>
    setEdges((eds) => eds.map((e) => ({ ...e, data: { ...e.data, ...patch(e) } })));

  // Runs one real Dijkstra step on the chosen node and updates the map
  const applyStep = (state, chosenId) => {
    const { distances, unvisited, visited, prev } = state;
    const newDistances = { ...distances };
    const newPrev = { ...prev };

    edges
      .filter((e) => e.source === chosenId)
      .forEach((edge) => {
        const neighborId = edge.target;
        if (unvisited.includes(neighborId)) {
          const newDist = newDistances[chosenId] + edge.data.weight;
          if (newDist < newDistances[neighborId]) {
            newDistances[neighborId] = newDist;
            newPrev[neighborId] = chosenId;
          }
        }
      });

    const newUnvisited = unvisited.filter((id) => id !== chosenId);
    const newVisited = [...visited, chosenId];
    const finished = newUnvisited.length === 0 || !newUnvisited.some((id) => newDistances[id] < Infinity);

    const next = {
      started: true,
      finished,
      distances: newDistances,
      unvisited: newUnvisited,
      visited: newVisited,
      prev: newPrev,
      stepCount: state.stepCount + 1,
      currentVisitingName: labelById[chosenId],
      currentVisitingId: chosenId,
    };
    setAlgoState(next);

    setNodes((nds) =>
      nds.map((n) => {
        if (n.type === 'tree') return n;
        const isCurrent = n.id === chosenId && !finished;
        const dist = newDistances[n.id];
        return {
          ...n,
          data: { ...n.data, distance: dist === Infinity ? '∞' : dist },
          style: {
            ...n.style,
            border: isCurrent ? `4px solid ${HIGHLIGHT}` : 'none',
            boxShadow: isCurrent ? '4px 4px 0 rgba(0,0,0,0.35)' : 'none',
            borderRadius: 0,
          },
        };
      })
    );

    setRoads((e) => ({ active: !finished && e.source === chosenId && newUnvisited.includes(e.target) }));
    return next;
  };

  const startTest = () => {
    clearTimeout(timeoutRef.current);

    const distances = {};
    initialNodes.forEach((n) => {
      distances[n.id] = n.id === 'start' ? 0 : Infinity;
    });
    const state = {
      ...emptyAlgo(),
      started: true,
      distances,
      unvisited: initialNodes.map((n) => n.id),
    };

    setAlgoState(state);
    setNodes((nds) =>
      nds.map((n) =>
        n.type === 'tree'
          ? n
          : { ...n, style: {}, data: { ...n.data, distance: n.id === 'start' ? 0 : '∞' } }
      )
    );
    setRoads(() => ({ showLabel: true, active: false }));

    setSeconds(0);
    setMistakes(0);
    setStats({ asked: 0, firstTry: 0 });
    setNewBest(false);
    setWrongIds([]);
    setFeedback(null);
    setLocked(false);
    setQuestion(buildQuestion(state, initialEdges));
  };

  const handleAnswer = (option) => {
    if (locked || !question) return;

    if (option.correct) {
      const hadWrong = wrongIds.length > 0;
      setStats((s) => ({ asked: s.asked + 1, firstTry: s.firstTry + (hadWrong ? 0 : 1) }));
      setFeedback({ ok: true, text: `Correct! ${question.explanation}` });
      setLocked(true);

      const nodeToVisit = question.kind === 'update' ? question.stepNodeId : option.id;
      timeoutRef.current = setTimeout(() => {
        const next = applyStep(algoState, nodeToVisit);
        setWrongIds([]);
        setFeedback(null);
        setLocked(false);
        setQuestion(next.finished ? null : buildQuestion(next, edges));
      }, 2200);
    } else {
      setMistakes((m) => m + 1);
      setWrongIds((w) => [...w, option.id]);
      setFeedback({ ok: false, text: `${option.hint} (+${WRONG_PENALTY}s)` });
    }
  };

  const labelOf = (id) => nodes.find((n) => n.id === id)?.data.label;
  const listNodes = nodes.filter((n) => n.type !== 'tree');

  /* ---------- render ---------- */

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
            : algoState.visited.map((id) => labelById[id]).join(' → ')}
        </div>
      </div>

      {/* CENTRE: town map on top, question panel underneath so it never covers the map */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            position: 'relative',
            backgroundColor: '#62b04c',
            backgroundImage: GRASS,
            backgroundSize: '96px 96px',
            imageRendering: 'pixelated',
          }}
        >
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
            {/* Timer */}
            <Panel position="top-left">
              <div style={{ ...pixelCard, ...headingFont, padding: '10px 14px', minWidth: '150px' }}>
                <div style={{ fontSize: '8px', marginBottom: '6px' }}>Time</div>
                <div style={{ fontSize: '20px', lineHeight: 1 }}>{formatTime(displaySeconds)}</div>
                <div style={{ fontSize: '8px', lineHeight: 1.8, marginTop: '8px' }}>
                  Mistakes: {mistakes}
                  {mistakes > 0 ? ` (+${mistakes * WRONG_PENALTY}s)` : ''}
                </div>
                {bestTime !== null && (
                  <div style={{ fontSize: '8px', lineHeight: 1.8 }}>Best: {formatTime(bestTime)}</div>
                )}
              </div>
            </Panel>

            <Panel position="top-right">
              <button className={`px-btn${algoState.started ? ' grey' : ''}`} onClick={startTest} style={algoState.started ? { opacity: 1 } : undefined}>
                {algoState.started ? 'Restart' : 'Start test'}
              </button>
            </Panel>
          </ReactFlow>
        </div>

        {/* QUESTION PANEL */}
        <div
          style={{
            ...WOOD,
            height: DOCK_HEIGHT,
            flexShrink: 0,
            borderTop: `4px solid ${INK}`,
            padding: '14px 18px',
            boxSizing: 'border-box',
            zIndex: 10,
          }}
        >
          <div style={{ ...pixelCard, ...bodyFont, height: '100%', boxSizing: 'border-box', padding: '12px 16px', overflowY: 'auto' }}>
            {!algoState.started && (
              <>
                <h3 style={{ ...headingFont, fontSize: '12px', lineHeight: 1.6, margin: '0 0 10px' }}>Ready to test yourself?</h3>
                <p style={{ fontSize: '22px', lineHeight: 1.15, margin: '0 0 12px', maxWidth: '640px' }}>
                  You'll be asked a question at every step of Dijkstra's Algorithm. The clock starts when you press
                  Start test and pauses while each answer is explained. Every wrong answer adds {WRONG_PENALTY} seconds.
                </p>
                <button className="px-btn" onClick={startTest}>
                  Start test
                </button>
              </>
            )}

            {algoState.started && question && (
              <>
                <div style={{ ...headingFont, fontSize: '10px', marginBottom: '8px' }}>
                  Question {algoState.stepCount + 1} of {TOTAL_QUESTIONS}
                </div>
                <p style={{ fontSize: '22px', lineHeight: 1.1, margin: '0 0 12px' }}>{question.prompt}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                  {question.options.map((opt) => {
                    const wasWrong = wrongIds.includes(opt.id);
                    const showRight = locked && opt.correct;
                    return (
                      <button
                        key={opt.id}
                        className={`px-btn ${showRight ? 'green' : wasWrong ? 'grey' : 'blue'}`}
                        disabled={locked || wasWrong}
                        onClick={() => handleAnswer(opt)}
                        style={showRight ? { opacity: 1 } : undefined}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <div style={{ minHeight: '24px', fontSize: '20px', lineHeight: 1.1, color: feedback?.ok ? '#1f7a2e' : '#b3261e' }}>
                  {feedback?.text}
                </div>
              </>
            )}

            {algoState.started && algoState.finished && (
              <>
                <h3 style={{ ...headingFont, fontSize: '12px', lineHeight: 1.6, margin: '0 0 10px' }}>Test complete!</h3>
                <div style={{ fontSize: '22px', lineHeight: 1.2, marginBottom: '12px' }}>
                  <div>
                    Final time: <strong>{formatTime(displaySeconds)}</strong>
                    {newBest ? '  (new best!)' : ''}
                  </div>
                  <div>
                    Correct first time: {stats.firstTry} of {stats.asked}
                  </div>
                  <div>
                    {mistakes === 0
                      ? 'Perfect run, no mistakes!'
                      : `${mistakes} wrong answer${mistakes === 1 ? '' : 's'} added ${mistakes * WRONG_PENALTY}s.`}
                  </div>
                </div>
                <button className="px-btn" onClick={startTest}>
                  Try again
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIGN: delivery run + all distances */}
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
            {routeFound ? pathIds.map(labelOf).join(' → ') : 'The route appears once this house has been visited.'}
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
