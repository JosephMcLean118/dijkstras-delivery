import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import BoardScene from './components/nodes/boardscene.jsx';

function App() {
  return (
    <div className="app-container">
      <BoardScene />
    </div>
  );
}

export default App;