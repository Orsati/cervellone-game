const crypto = require('crypto');
const { getPublicQuestion, fineRound } = require('../logic/gameLogic');

const registerConnectionHandlers = (io, socket, gameState, config) => {
    const timerDuration = gameState.domandaCorrente?.duration || (gameState.isPaused ? gameState.timerRemainingTime : 0);
    socket.emit('state:sync', {
        fase: gameState.fase, isPaused: gameState.isPaused, pausedPlayer: gameState.giocatori.find(p => p.id === null)?.nickname || '',
        currentQuestion: getPublicQuestion(gameState.domandaCorrente), players: gameState.giocatori,
        resultsData: gameState.fase === 'risultati' ? gameState.ultimoRisultato : null,
        timerDuration: timerDuration, playerNetworkUrl: gameState.playerNetworkUrl
    });

    socket.on('player:reconnect', (data) => {
        if (!data.playerId) return;
        const player = gameState.giocatori.find(p => p.playerId === data.playerId);
        if (player) {
            player.id = socket.id;
            const haRisposto = gameState.eventiDelRound.some(e => e.playerId === player.playerId);
            
            // --- MODIFICA CHIAVE ---
            // Invia la domanda solo se la fase è 'domanda', altrimenti invia 'null'.
            const domandaDaInviare = gameState.fase === 'domanda' ? getPublicQuestion(gameState.domandaCorrente) : null;

            socket.emit('player:reconnected', { 
                nickname: player.nickname, 
                currentQuestion: domandaDaInviare, 
                hasAnswered: haRisposto 
            });

            io.emit('game:update', gameState.giocatori);
            const isAnyoneDisconnected = gameState.giocatori.some(p => p.id === null);
            if (gameState.isPaused && !isAnyoneDisconnected) {
                gameState.isPaused = false;
                if (gameState.fase === 'domanda') {
                    gameState.inizioDomandaTimestamp = Date.now();
                    gameState.timerID = setTimeout(() => fineRound(io, gameState), gameState.timerRemainingTime);
                }
                io.emit('game:resumed', { timerDuration: gameState.timerRemainingTime });
            }
        } else {
            socket.emit('player:not-found');
        }
    });

    socket.on('giocatore:entra', (data) => {
        const playerId = crypto.randomUUID();
        const newPlayer = { id: socket.id, playerId: playerId, nickname: data.nickname, score: 0 };
        gameState.giocatori.push(newPlayer);
        socket.emit('player:registered', { playerId: playerId });
        io.emit('game:update', gameState.giocatori);
    });

    socket.on('disconnect', () => {
        const player = gameState.giocatori.find(p => p.id === socket.id);
        if (player) {
            player.id = null;
            io.emit('game:update', gameState.giocatori);
            if (gameState.fase !== 'lobby' && !gameState.isPaused) {
                if (gameState.fase === 'domanda') {
                    clearTimeout(gameState.timerID);
                    const elapsedTime = Date.now() - gameState.inizioDomandaTimestamp;
                    const currentQuestionDuration = gameState.domandaCorrente.duration || config.QUESTION_TIMER_DEFAULT;
                    gameState.timerRemainingTime = Math.max(0, currentQuestionDuration - elapsedTime);
                }
                gameState.isPaused = true;
                io.emit('game:paused', { player: player.nickname });
            }
        }
    });
};

module.exports = { registerConnectionHandlers };