// frontend-projector/src/components/LobbyScreen.jsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

function LobbyScreen({ players, onStartGame, playerUrl }) {
  return (
    <div className="lobby-container">
      <h1 className="main-title">Quizzone</h1>
      
      <div className="players-list">
        <h2>Giocatori Connessi ({players.length})</h2>
        <ul>
          {players.map((p) => (
            <li key={p.playerId}>{p.nickname} {p.id ? '✅' : '❌'}</li>
          ))}
        </ul>
        {players.length > 0 && (
          <button className="start-button" onClick={onStartGame}>Inizia Gioco!</button>
        )}
      </div>

      <div className="qr-code-container">
        <h3>Entra nel gioco!</h3>
        <p>Inquadra il QR Code con il tuo telefono</p>
        {playerUrl && playerUrl !== 'URL non disponibile' ? (
          <div className="qr-code-wrapper">
            <QRCodeSVG value={playerUrl} size={200} bgColor={"#ffffff"} fgColor={"#000000"} />
          </div>
        ) : (
          <p>In attesa dell'indirizzo di rete...</p>
        )}
        <p className="network-url">{playerUrl}</p>
      </div>
    </div>
  );
}
export default LobbyScreen;