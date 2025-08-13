import React from 'react';
import LobbyScreen from './LobbyScreen';
import QuestionScreen from './QuestionScreen';
import ResultsScreen from './ResultsScreen';
import QuestionIntroScreen from './QuestionIntroScreen';

function ProjectorView({ fase, ...props }) {
  switch (fase) {
    case 'lobby':
      return <LobbyScreen players={props.players} onStartGame={props.handleStartGame} playerUrl={props.playerUrl} />;
    
    case 'question-intro':
        return <QuestionIntroScreen questionType={props.introData.type} onStartQuestion={props.handleStartQuestion} />;

    case 'domanda':
      return props.currentQuestion ? <QuestionScreen question={props.currentQuestion} timerDuration={props.timerDuration} isPaused={props.isPaused} /> : null;

    case 'risultati':
      return props.currentQuestion ? <ResultsScreen question={props.currentQuestion} correctAnswer={props.correctAnswer} roundResults={props.roundResults} onNextQuestion={props.handleNextQuestion} /> : null;

    default:
      return <h2>Caricamento...</h2>;
  }
}

export default ProjectorView;