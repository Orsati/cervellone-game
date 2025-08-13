import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const GameContext = createContext();

const socket = io(`http://${window.location.hostname}:3001`, {
    query: { playerId: localStorage.getItem('quizPlayerId') }
});

export function GameProvider({ children }) {
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [nickname, setNickname] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [pauseData, setPauseData] = useState({ isPaused: false, player: '' });

    useEffect(() => {
        const playerId = localStorage.getItem('quizPlayerId');
        if (playerId) {
            socket.emit('player:reconnect', { playerId });
        } else {
            setConnectionStatus('login');
        }

        socket.on('player:registered', (data) => { localStorage.setItem('quizPlayerId', data.playerId); });
        
        socket.on('player:reconnected', (data) => {
            setNickname(data.nickname);
            setCurrentQuestion(data.currentQuestion);
            setHasAnswered(data.hasAnswered);
            setConnectionStatus(data.currentQuestion ? 'question' : 'lobby');
        });
        
        socket.on('player:not-found', () => {
            localStorage.removeItem('quizPlayerId');
            setConnectionStatus('login');
        });
        
        socket.on('game:new-question', (data) => {
            setCurrentQuestion(data.question);
            setHasAnswered(false);
            setConnectionStatus('question');
        });
        
        socket.on('player:answered', (data) => {
            const myPlayerId = localStorage.getItem('quizPlayerId');
            if (data.playerId === myPlayerId) {
                setHasAnswered(true);
            }
        });

        socket.on('game:reveal-answer', () => {
            // Quando il round finisce, puliamo la domanda e andiamo allo stato 'round-over'
            setCurrentQuestion(null);
            setConnectionStatus('round-over'); 
        });

        socket.on('game:paused', (data) => { setPauseData({ isPaused: true, player: data.player }); });
        
        socket.on('game:resumed', () => { setPauseData({ isPaused: false, player: '' }); });

        // Funzione di pulizia per rimuovere tutti i listener quando il componente si smonta
        return () => {
            socket.off('player:registered');
            socket.off('player:reconnected');
            socket.off('player:not-found');
            socket.off('game:new-question');
            socket.off('player:answered');
            socket.off('game:reveal-answer');
            socket.off('game:paused');
            socket.off('game:resumed');
        };
    }, []);

    const handleJoin = (chosenNickname) => {
        socket.emit('giocatore:entra', { nickname: chosenNickname });
        setNickname(chosenNickname);
        setConnectionStatus('lobby');
    };

    const handleAnswer = (option) => {
        socket.emit('player:answer', { answer: option });
    };

    // L'oggetto "bacheca" con tutti i dati e le funzioni da condividere
    const value = {
        connectionStatus,
        nickname,
        currentQuestion,
        hasAnswered,
        pauseData,
        handleJoin,
        handleAnswer
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}

// Hook personalizzato per usare il nostro context più facilmente
export const useGame = () => {
    return useContext(GameContext);
};