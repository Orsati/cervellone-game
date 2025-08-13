// frontend-player/src/components/GameView.jsx
import React from 'react';
import { useGame } from '../context/GameContext';
import LoginScreen from './LoginScreen';
import LobbyScreen from './LobbyScreen';
import QuestionScreen from './QuestionScreen';
import RoundOverScreen from './RoundOverScreen'; // Importa il nuovo componente

function GameView() {
  const { connectionStatus, currentQuestion, pauseData } = useGame();

  if (pauseData.isPaused) {
    return (
        <div className="game-container pause-overlay">
            <h1>Gioco in Pausa</h1>
            <p>In attesa che <strong>{pauseData.player}</strong> si riconnetta...</p>
        </div>
    );
  }

  switch (connectionStatus) {
    case 'connecting':
      return <div className="game-container"><h1>Connessione...</h1></div>;
    case 'login':
      return <LoginScreen />;
    case 'lobby':
      return <LobbyScreen />;
    case 'question':
      return currentQuestion ? <QuestionScreen /> : <LobbyScreen />;
    // --- NUOVO STATO ---
    case 'round-over':
      return <RoundOverScreen />;
    default:
      return <div className="game-container"><h1>Caricamento...</h1></div>;
  }
}

export default GameView;