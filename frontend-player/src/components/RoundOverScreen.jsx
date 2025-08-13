// frontend-player/src/components/RoundOverScreen.jsx
import React from 'react';
import { useGame } from '../context/GameContext';

function RoundOverScreen() {
  const { nickname } = useGame();

  return (
    <div className="game-container">
      <h1>Round Terminato!</h1>
      <p>Attendi la prossima domanda...</p>
      <p>Punteggio attuale per <strong>{nickname}</strong> visibile sul proiettore.</p>
    </div>
  );
}

export default RoundOverScreen;