import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import io from 'socket.io-client';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import './index.css';

const socket = io('http://localhost:4000');

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [projectorUrl, setProjectorUrl] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/status')
      .then(res => res.json())
      .then(data => setIsRunning(data.isRunning));

    socket.on('status-change', (data) => {
        setIsRunning(data.isRunning);
        if (!data.isRunning) setProjectorUrl('');
    });
    socket.on('log', (newLog) => setLogs(prevLogs => [...prevLogs, newLog]));
    socket.on('servers:ready', (data) => setProjectorUrl(data.projectorUrl));

    return () => {
      socket.off('status-change');
      socket.off('log');
      socket.off('servers:ready');
    };
  }, []);

  const handleStart = () => {
    setLogs(['Avvio dei server in corso...']);
    setProjectorUrl('');
    fetch('http://localhost:4000/api/start').catch(err => console.error(err));
  };

  const handleStop = () => {
    fetch('http://localhost:4000/api/stop').catch(err => console.error(err));
  };

  const openProjector = () => {
    if (projectorUrl) window.open(projectorUrl, '_blank');
  };

  return (
    <div className="admin-layout">
      <nav className="sidebar">
        <h1>QUIZZONE</h1>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/settings">Impostazioni</NavLink>
      </nav>
      <main className="content">
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                isRunning={isRunning}
                logs={logs}
                projectorUrl={projectorUrl}
                onStart={handleStart}
                onStop={handleStop}
                onOpenProjector={openProjector}
              />
            } 
          />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;