const QUESTION_TIMER_DEFAULT = 10000;
const PENALTY_POINTS = -25;
const BASE_POINTS = 100;

function getPublicQuestion(question) {
    if (!question) return null;
    const { rispostaCorretta, ...publicQuestionData } = question;
    if (publicQuestionData.type === 'vero-falso' && !publicQuestionData.opzioni) {
        publicQuestionData.opzioni = ['Vero', 'Falso'];
    }
    return publicQuestionData;
}

function calcolaRisultatiDelRound(gameState) {
    if (!gameState.domandaCorrente) return [];
    const { rispostaCorretta, type } = gameState.domandaCorrente;
    const risposte = gameState.eventiDelRound.filter(e => e.type === 'answer');
    let risultati = [];
    gameState.giocatori.forEach(player => {
        const rispostaGiocatore = risposte.find(r => r.playerId === player.playerId);
        let roundScore = 0; let tempoDiRisposta = null; let answeredCorrectly = false;
        if (rispostaGiocatore) {
            tempoDiRisposta = rispostaGiocatore.timestamp - gameState.inizioDomandaTimestamp;
            const isCorrect = (type === 'sbaglia-e-vinci') ? rispostaGiocatore.answer !== rispostaCorretta : (type === 'vero-falso') ? (rispostaGiocatore.answer === 'Vero') === rispostaCorretta : rispostaGiocatore.answer === rispostaCorretta;
            if (isCorrect) {
                answeredCorrectly = true;
                const bonusVelocita = Math.max(0, 50 - Math.floor(tempoDiRisposta / 200));
                roundScore = BASE_POINTS + bonusVelocita;
            }
        } else {
            if(player.id) roundScore = PENALTY_POINTS;
        }
        player.score += roundScore;
        risultati.push({ playerId: player.playerId, nickname: player.nickname, responseTime: tempoDiRisposta, roundScore: roundScore, totalScore: player.score, answeredCorrectly });
    });
    return risultati.sort((a, b) => b.roundScore - a.roundScore || (a.responseTime || Infinity) - (b.responseTime || Infinity));
}

function fineRound(io, gameState) {
    clearTimeout(gameState.timerID);
    if (gameState.fase === 'domanda') {
        const risultati = calcolaRisultatiDelRound(gameState);
        gameState.fase = 'risultati';
        gameState.ultimoRisultato = { correctAnswer: String(gameState.domandaCorrente.rispostaCorretta), results: risultati, question: getPublicQuestion(gameState.domandaCorrente) };
        io.emit('game:reveal-answer', gameState.ultimoRisultato);
    }
}

module.exports = { getPublicQuestion, calcolaRisultatiDelRound, fineRound };