const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const fs = require('fs');
const path = require('path');
const { registerConnectionHandlers } = require('./handlers/connectionHandler');
const { registerGameHandlers } = require('./handlers/gameHandler');
const { registerPlayerHandlers } = require('./handlers/playerHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
const PORT_GIOCO = 3001;

// --- LEGGE L'URL DEL GIOCATORE DAGLI ARGOMENTI DI AVVIO ---
const playerNetworkUrl = process.argv[2] || 'URL non disponibile';
console.log(`[Game Server] URL per i giocatori ricevuto: ${playerNetworkUrl}`);

let config = {};
try {
    const configPath = path.join(__dirname, '../config.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configData);
} catch (error) {
    console.error("❌ Errore config.json:", error);
    process.exit(1);
}

let tutteLeDomande = [];
try {
    const jsonPath = path.join(__dirname, 'domande.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    tutteLeDomande = JSON.parse(jsonData);
} catch (error) {
    console.error("❌ Errore domande.json:", error);
    process.exit(1);
}

let gameState = {
  fase: 'lobby', isPaused: false, domandaCorrente: null, giocatori: [], timerID: null,
  domandeUtilizzate: new Set(), eventiDelRound: [], inizioDomandaTimestamp: null,
  timerRemainingTime: null, ultimoRisultato: null,
  playerNetworkUrl: playerNetworkUrl // --- SALVA L'URL NELLO STATO DEL GIOCO ---
};

const onConnection = (socket) => {
    console.log(`[Game Server] Utente connesso: ${socket.id}`);
    registerConnectionHandlers(io, socket, gameState, config);
    const fineRound = registerGameHandlers(io, socket, gameState, tutteLeDomande, config);
    registerPlayerHandlers(io, socket, gameState, fineRound);
};
io.on("connection", onConnection);

server.listen(PORT_GIOCO, () => {
    console.log(`--- Motore di Gioco ATTIVO sulla porta ${PORT_GIOCO} ---`);
});