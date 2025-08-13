import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

function LoginScreen() {
  const { handleJoin } = useGame();
  const [nickname, setNickname] = useState('');

  const handleJoinClick = () => {
    if (nickname.trim() !== '') {
      handleJoin(nickname);
    }
  };

  return (
    <div className="login-container">
      <h1>Benvenuto al Quiz!</h1>
      <p>Inserisci il tuo nome per partecipare:</p>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Il tuo nickname"
      />
      <button onClick={handleJoinClick}>Entra nel Gioco</button>
    </div>
  );
}
export default LoginScreen;