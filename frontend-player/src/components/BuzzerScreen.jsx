// src/components/BuzzerScreen.jsx

import React from 'react';

function BuzzerScreen({ onBuzz, buzzerLocked, hasAnsweredThisRound }) {
  const isDisabled = buzzerLocked || hasAnsweredThisRound;
  let message = '';
  if (hasAnsweredThisRound) {
    message = 'Hai già tentato la fortuna!';
  } else if (buzzerLocked) {
    message = 'Qualcuno si è prenotato!';
  }

  return (
    <div className="buzzer-view">
      <button className="buzzer-button" onClick={onBuzz} disabled={isDisabled}>
        BUZZER
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default BuzzerScreen;