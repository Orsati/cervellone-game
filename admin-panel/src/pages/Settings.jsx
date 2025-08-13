import React, { useState, useEffect } from 'react';
import '../index.css';

function Settings() {
    const [config, setConfig] = useState(null);
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [message, setMessage] = useState('');
    const [roundsText, setRoundsText] = useState(''); // Stato separato per l'area di testo

    useEffect(() => {
        // Al caricamento, chiede sia la configurazione che la lista di domande
        Promise.all([
            fetch('http://localhost:4000/api/config').then(res => res.json()),
            fetch('http://localhost:4000/api/questions').then(res => res.json())
        ])
        .then(([configData, questionsData]) => {
            setConfig(configData);
            setAvailableQuestions(questionsData);
            // Inizializza l'area di testo con la struttura dei round attuale, ben formattata
            setRoundsText(JSON.stringify(configData.gameSetup.rounds, null, 2));
        })
        .catch(err => {
            console.error("Errore nel caricamento dati:", err);
            setMessage('Errore nel caricare i dati. Assicurati che i server siano attivi.');
        });
    }, []);

    // Gestore per i campi di input semplici
    const handleChange = (e, category, key) => {
        const value = e.target.type === 'number' ? parseInt(e.target.value, 10) || 0 : e.target.value;
        setConfig(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    // Salva le modifiche inviando la nuova configurazione al manager
    const handleSave = () => {
        setMessage('Salvataggio in corso...');
        let rounds;
        try {
            // Controlla che il testo nell'area sia un JSON valido prima di salvare
            rounds = JSON.parse(roundsText);
        } catch (error) {
            setMessage('Errore: La struttura dei round non è un JSON valido!');
            return;
        }

        const newConfig = { ...config, gameSetup: { ...config.gameSetup, rounds } };

        fetch('http://localhost:4000/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newConfig)
        })
        .then(res => {
            if (res.ok) {
                setMessage('Impostazioni salvate con successo!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Errore nel salvataggio. Riprova.');
            }
        })
        .catch(() => setMessage('Errore di connessione con il server.'));
    };

    if (!config) return <h2>Caricamento impostazioni...</h2>;

    return (
        <div className="settings-page">
            <h1>Impostazioni del Gioco</h1>
            
            <div className="setting-card">
                <h2>Punteggi 🏆</h2>
                <label>Punti Risposta Corretta:</label>
                <input type="number" value={config.punteggi.rispostaCorretta} onChange={e => handleChange(e, 'punteggi', 'rispostaCorretta')} />
                
                <label>Bonus Velocità Massimo:</label>
                <input type="number" value={config.punteggi.bonusVelocitaMax} onChange={e => handleChange(e, 'punteggi', 'bonusVelocitaMax')} />

                <label>Penalità (valore negativo):</label>
                <input type="number" value={config.punteggi.penalita} onChange={e => handleChange(e, 'punteggi', 'penalita')} />
            </div>

            <div className="setting-card">
                <h2>Timer di Default (in millisecondi) ⏱️</h2>
                <label>Risposta Multipla:</label>
                <input type="number" step="1000" value={config.timers.rispostaMultipla} onChange={e => handleChange(e, 'timers', 'rispostaMultipla')} />

                <label>Vero o Falso:</label>
                <input type="number" step="1000" value={config.timers.veroFalso} onChange={e => handleChange(e, 'timers', 'veroFalso')} />
                 
                <label>Sbaglia e Vinci:</label>
                <input type="number" step="1000" value={config.timers.sbagliaEVinci} onChange={e => handleChange(e, 'timers', 'sbagliaEVinci')} />
            </div>
            
            <div className="setting-card">
                <h2>Struttura Gioco 🎲</h2>
                <div className="game-structure-editor">
                    <div className="available-questions">
                        <h3>Domande Disponibili</h3>
                        <p>Usa questi ID per costruire i round:</p>
                        <ul>
                            {availableQuestions.map(q => (
                                <li key={q.id}><strong>{q.id}</strong>: {q.testoDomanda.substring(0, 40)}...</li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounds-editor">
                        <h3>Copione dei Round</h3>
                        <p>Inserisci gli ID in formato JSON `[["q1"], ["q2", "q3"]]`</p>
                        <textarea
                            value={roundsText}
                            onChange={(e) => setRoundsText(e.target.value)}
                            rows="10"
                        />
                    </div>
                </div>
            </div>

            <div className="save-container">
                <button onClick={handleSave} className="save-button">Salva Impostazioni</button>
                {message && <p className="save-message">{message}</p>}
            </div>
        </div>
    );
}

export default Settings;