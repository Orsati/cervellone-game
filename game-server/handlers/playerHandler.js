const registerPlayerHandlers = (io, socket, gameState, config) => {
    socket.on('player:answer', (data) => {
        if (gameState.isPaused) return;
        const player = gameState.giocatori.find(p => p.id === socket.id);
        if (!player) return;
        
        const haGiaRisposto = gameState.eventiDelRound.some(e => e.playerId === player.playerId);
        
        if (!haGiaRisposto) {
            gameState.eventiDelRound.push({ type: 'answer', playerId: player.playerId, answer: data.answer, timestamp: Date.now() });
            io.emit('player:answered', { playerId: player.playerId });
        }
    });
};

module.exports = { registerPlayerHandlers };