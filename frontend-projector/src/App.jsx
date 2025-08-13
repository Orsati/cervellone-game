import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './index.css';
import ProjectorView from './components/ProjectorView';

const socket = io('http://localhost:3001');

function App() {
  const [players, setPlayers] = useState([]);
  const [fase, setFase] = useState('lobby');
  const [isPaused, setIsPaused] = useState(false);
  const [pausedPlayer, setPausedPlayer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [roundResults, setRoundResults] = useState([]);
  const [timerDuration, setTimerDuration] = useState(0);
  const [playerUrl, setPlayerUrl] = useState('');
  const [introData, setIntroData] = useState(null);

  useEffect(() => {
    socket.on('state:sync', (s) => {
      setPlayers(s.players);
      setFase(s.fase);
      setIsPaused(s.isPaused);
      setPausedPlayer(s.pausedPlayer);
      setCurrentQuestion(s.currentQuestion);
      setTimerDuration(s.timerDuration > 0 ? s.timerDuration : 0);
      setPlayerUrl(s.playerNetworkUrl);
      if (s.fase === 'risultati' && s.resultsData) {
        setCorrectAnswer(s.resultsData.correctAnswer);
        setRoundResults(s.resultsData.results);
        setCurrentQuestion(s.resultsData.question);
      } else if (s.fase !== 'domanda' && s.fase !== 'question-intro') {
        setCurrentQuestion(null);
        setRoundResults([]);
      }
    });
    socket.on('game:update', (p) => { setPlayers([...p]); });
    socket.on('game:question-intro', (data) => { setFase('question-intro'); setIntroData(data); });
    socket.on('game:new-question', (data) => {
      setCurrentQuestion(data.question);
      setRoundResults([]);
      setFase('domanda');
      setTimerDuration(data.timerDuration);
    });
    socket.on('game:reveal-answer', (d) => {
      setCorrectAnswer(d.correctAnswer);
      setRoundResults(d.results);
      setFase('risultati');
    });
    socket.on('game:paused', (d) => { setIsPaused(true); setPausedPlayer(d.player); });
    socket.on('game:resumed', (data) => { setIsPaused(false); setTimerDuration(data.timerDuration); });

    return () => { socket.off(); };
  }, []);

const handleStartGame = () => { socket.emit('game:start'); };
  const handleNextQuestion = () => { socket.emit('game:start'); };
  // --- NUOVA FUNZIONE HANDLER ---
  const handleStartQuestion = () => { socket.emit('presenter:start-question'); };

  return (
    <div className="projector-screen">
      {isPaused && (<div className="pause-overlay"><h1>Gioco in Pausa</h1><p>In attesa di <strong>{pausedPlayer}</strong>...</p></div>)}
      
      <ProjectorView
        fase={fase}
        players={players}
        handleStartGame={handleStartGame}
        currentQuestion={currentQuestion}
        timerDuration={timerDuration}
        isPaused={isPaused}
        correctAnswer={correctAnswer}
        roundResults={roundResults}
        handleNextQuestion={handleNextQuestion}
        playerUrl={playerUrl}
        introData={introData}
        handleStartQuestion={handleStartQuestion} // Passa la nuova funzione
      />
    </div>
  );
}

export default App;