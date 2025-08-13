import React, { useState, useEffect } from 'react';

function Timer({ duration, isPaused }) {
  const [timeLeft, setTimeLeft] = useState(duration / 1000);

  useEffect(() => {
    setTimeLeft(duration / 1000);
  }, [duration]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, isPaused]);

  const durationInSeconds = duration / 1000;
  const percentage = durationInSeconds > 0 ? (timeLeft / durationInSeconds) * 100 : 0;

  return (
    <div className="timer-container">
      <div className="timer-bar" style={{ width: `${percentage}%` }}></div>
      <span className="timer-text">{Math.max(0, Math.ceil(timeLeft))}</span>
    </div>
  );
}

export default Timer;