import React, { useRef, useEffect } from 'react';

function Dashboard({ isRunning, logs, projectorUrl, onStart, onStop, onOpenProjector }) {
  const logsEndRef = useRef(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [logs]);

  return (
    <div className="admin-panel">
      <header>
        <h1>Dashboard</h1>
        <div className="status">
          Stato del Gioco: 
          <span className={isRunning ? 'status-on' : 'status-off'}>
            {isRunning ? 'ATTIVO' : 'SPENTO'}
          </span>
        </div>
      </header>
      <div className="controls">
        <button onClick={onStart} disabled={isRunning}>▶️ Avvia Gioco</button>
        <button onClick={onOpenProjector} disabled={!isRunning || !projectorUrl}>🖥️ Apri Proiettore</button>
        <button onClick={onStop} disabled={!isRunning}>⏹️ Ferma Gioco</button>
      </div>
      <div className="log-viewer">
        <div className="log-header">Log dei Server</div>
        <pre className="log-content">
          {logs.map((log, index) => (<div key={index}>{log}</div>))}
          <div ref={logsEndRef} />
        </pre>
      </div>
    </div>
  );
}

export default Dashboard;