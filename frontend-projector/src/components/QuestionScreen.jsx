import React from 'react';
import Timer from './Timer';

function QuestionScreen({ question, timerDuration, isPaused }) {
  return (
    <div className="question-display">
      <Timer 
        key={`${question.id}-${timerDuration}`} 
        duration={timerDuration} 
        isPaused={isPaused} 
      />
      <h3 className="question-type">{question.type || 'Quiz'}</h3>
      <h2>{question.testoDomanda}</h2>
      <div className="options-grid">
        {question.opzioni && question.opzioni.map((option, index) => (
          <div key={index} className="option">{option}</div>
        ))}
      </div>
    </div>
  );
}

export default QuestionScreen;