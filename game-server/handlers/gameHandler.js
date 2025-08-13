const { getPublicQuestion, fineRound } = require('../logic/gameLogic');

const registerGameHandlers = (io, socket, gameState, tutteLeDomande, config) => {
    
    // Questo evento ora prepara solo la domanda e mostra l'intro
    socket.on('game:start', () => {
        if (gameState.isPaused) return;
        
        gameState.ultimoRisultato = null;
        
        let domandeDisponibili = tutteLeDomande.filter(q => !gameState.domandeUtilizzate.has(q.id));
        if (domandeDisponibili.length === 0 && tutteLeDomande.length > 0) {
            gameState.domandeUtilizzate.clear();
            domandeDisponibili = tutteLeDomande;
        }

        if (domandeDisponibili.length > 0) {
            gameState.domandaCorrente = domandeDisponibili[Math.floor(Math.random() * domandeDisponibili.length)];
            gameState.domandeUtilizzate.add(gameState.domandaCorrente.id);
            
            gameState.fase = 'question-intro';
            io.emit('game:question-intro', { type: gameState.domandaCorrente.type || 'Quiz' });
        }
    });

    // NUOVO EVENTO: Questo viene chiamato dal pulsante "Avvia" del presentatore
    socket.on('presenter:start-question', () => {
        if (gameState.isPaused || gameState.fase !== 'question-intro') return;

        gameState.fase = 'domanda';
        gameState.eventiDelRound = [];
        gameState.inizioDomandaTimestamp = Date.now();
        
        const timerDuration = gameState.domandaCorrente.duration || config.QUESTION_TIMER_DEFAULT;
        io.emit('game:new-question', {
            question: getPublicQuestion(gameState.domandaCorrente),
            timerDuration: timerDuration
        });
        gameState.timerID = setTimeout(() => fineRound(io, gameState), timerDuration);
    });

    socket.on('game:resumed', (data) => {
        if(gameState.fase === 'domanda'){
            gameState.inizioDomandaTimestamp = Date.now();
            gameState.timerID = setTimeout(() => fineRound(io, gameState), data.timerDuration);
        }
    });
};

module.exports = { registerGameHandlers };