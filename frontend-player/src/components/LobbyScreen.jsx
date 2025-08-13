import React from 'react';
import { useGame } from '../context/GameContext';

function LobbyScreen() {
  const { nickname } = useGame();
  return (
    <div className="game-container">
      <h1>In attesa che il gioco inizi...</h1>
      <p>Benvenuto, <strong>{nickname}</strong>!</p>
    </div>
  );
}
export default LobbyScreen;