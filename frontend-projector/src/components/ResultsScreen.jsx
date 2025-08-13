import React from 'react';

function ResultsScreen({ question, correctAnswer, roundResults, onNextQuestion }) {
  return (
    <div className="results-display">
      <h3 className="question-type">{question.type || 'Quiz'}</h3>
      <h2>La risposta corretta era: <strong>{correctAnswer}</strong></h2>
      <div className="leaderboard">
        <h3>Classifica del Round</h3>
        <ul className="round-leaderboard">
          {roundResults.map(res => (
            <li key={res.playerId} className={res.answeredCorrectly ? 'correct-answer' : 'incorrect-answer'}>
              <span className="player-name">{res.nickname}</span>
              <span className="response-time">{res.responseTime ? `${(res.responseTime / 1000).toFixed(2)}s` : 'N/D'}</span>
              <span className="round-score">{res.roundScore >= 0 ? `+${res.roundScore}` : res.roundScore}</span>
              <span className="total-score">Tot: {res.totalScore}</span>
            </li>
          ))}
        </ul>
      </div>
      <button className="start-button" onClick={onNextQuestion}>Prossima Domanda</button>
    </div>
  );
}

export default ResultsScreen;