import React from 'react';
import { useGame } from '../context/GameContext';

function QuestionScreen() {
  const { currentQuestion, handleAnswer, hasAnswered } = useGame();
  return (
    <div className="answer-view">
      <h2>{currentQuestion.testoDomanda}</h2>
      <div className="options-grid-player">
        {currentQuestion.opzioni.map((option, index) => (
          <button key={index} onClick={() => handleAnswer(option)} disabled={hasAnswered}>
            {hasAnswered ? 'Inviata' : option}
          </button>
        ))}
      </div>
      {hasAnswered && <p>Risposta inviata! Attendi gli altri...</p>}
    </div>
  );
}
export default QuestionScreen;