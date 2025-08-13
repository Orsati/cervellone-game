import React from 'react';

const gameTitles = {
    'risposta-multipla': 'Quiz Classico',
    'vero-falso': 'Vero o Falso',
    'sbaglia-e-vinci': 'Sbaglia e Vinci',
    'musicale': 'Indovina la Canzone'
};

// Ora riceve una funzione 'onStartQuestion' da chiamare al click
function QuestionIntroScreen({ questionType, onStartQuestion }) {
  const title = gameTitles[questionType] || questionType;
  return (
    <div className="intro-screen">
      <h2 className="intro-subtitle">Prossima Domanda</h2>
      <h1 className="intro-title">{title}</h1>
      <button className="start-button" onClick={onStartQuestion}>
        Avvia Domanda
      </button>
    </div>
  );
}

export default QuestionIntroScreen;