const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json()); // Middleware per leggere il corpo delle richieste POST in JSON

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = 4000;
const CONFIG_PATH = path.join(__dirname, 'config.json');

let runningProcesses = {};
let playerNetworkUrl = '';
let projectorUrl = '';

function sendLog(socket, prefix, data) {
    const log = data.toString();
    const cleanLog = log.replace(/[\u001b\u009b][[()#;?]?[0-9]{1,4}(;[0-9]{0,4})?([0-9A-ORZcf-nqry=><])/g, '');
    cleanLog.split('\n').forEach(line => {
        if (line.trim() !== '') {
            const finalLog = `[${prefix}]: ${line.trim()}`;
            console.log(finalLog);
            socket.emit('log', finalLog);
        }
    });
}

function stopAllProcesses() {
    console.log('Fermo tutti i server...');
    for (const [name, process] of Object.entries(runningProcesses)) {
        process.kill('SIGINT');
    }
    runningProcesses = {};
}

function checkAndSignalIfReady() {
    if (playerNetworkUrl && projectorUrl) {
        console.log('✅ Tutti i server sono pronti e gli URL sono stati scambiati.');
        io.emit('servers:ready', { projectorUrl: projectorUrl });
    }
}

function startGameServer(url) {
    const gameServer = spawn('node', ['game-server/index.js', url]);
    runningProcesses['game-server'] = gameServer;
    gameServer.stdout.on('data', (data) => sendLog(io, 'game-server', data));
    gameServer.stderr.on('data', (data) => sendLog(io, `ERRORE-game-server`, data));
    gameServer.on('close', () => {
        io.emit('log', `[game-server] terminato.`);
        delete runningProcesses['game-server'];
        if (Object.keys(runningProcesses).length === 0) io.emit('status-change', { isRunning: false });
    });
}

function startProjectorServer() {
    const projector = spawn('npm', ['run', 'dev', '--prefix', 'frontend-projector']);
    runningProcesses['projector'] = projector;
    projector.stdout.on('data', (data) => {
        const rawLog = data.toString();
        sendLog(io, 'projector', rawLog);
        if (!projectorUrl) {
            const cleanLog = rawLog.replace(/[\u001b\u009b][[()#;?]?[0-9]{1,4}(;[0-9]{0,4})?([0-9A-ORZcf-nqry=><])/g, '');
            const match = cleanLog.match(/Local:\s*(http:\/\/[^\s]+)/);
            if (match && match[1]) {
                projectorUrl = match[1];
                console.log(`✅ URL del proiettore catturato: ${projectorUrl}`);
                checkAndSignalIfReady();
            }
        }
    });
    projector.stderr.on('data', (data) => sendLog(io, `ERRORE-projector`, data));
    projector.on('close', () => {
        io.emit('log', `[projector] terminato.`);
        delete runningProcesses['projector'];
        if (Object.keys(runningProcesses).length === 0) io.emit('status-change', { isRunning: false });
    });
}

app.get('/api/start', (req, res) => {
    if (Object.keys(runningProcesses).length > 0) return res.status(400).send('I server sono già attivi.');
    playerNetworkUrl = '';
    projectorUrl = '';
    const player = spawn('npm', ['run', 'dev', '--prefix', 'frontend-player', '--', '--host']);
    runningProcesses['player'] = player;
    player.stdout.on('data', (data) => {
        const rawLog = data.toString();
        sendLog(io, 'player', rawLog);
        if (!playerNetworkUrl) {
            const cleanLog = rawLog.replace(/[\u001b\u009b][[()#;?]?[0-9]{1,4}(;[0-9]{0,4})?([0-9A-ORZcf-nqry=><])/g, '');
            const match = cleanLog.match(/Network:\s*(http:\/\/[^\s]+)/);
            if (match && match[1]) {
                playerNetworkUrl = match[1];
                console.log(`✅ URL di rete per i giocatori catturato: ${playerNetworkUrl}`);
                startGameServer(playerNetworkUrl);
                startProjectorServer();
            }
        }
    });
    player.stderr.on('data', (data) => sendLog(io, `ERRORE-player`, data));
    player.on('close', (code) => {
        io.emit('log', `[player] terminato.`);
        delete runningProcesses['player'];
        if (Object.keys(runningProcesses).length === 0) io.emit('status-change', { isRunning: false });
    });
    io.emit('status-change', { isRunning: true });
    res.send('Avvio dei server in corso...');
});

app.get('/api/stop', (req, res) => {
    if (Object.keys(runningProcesses).length === 0) return res.status(400).send('Nessun server attivo.');
    stopAllProcesses();
    res.send('Server in fase di arresto.');
});

app.get('/api/status', (req, res) => {
    res.json({ isRunning: Object.keys(runningProcesses).length > 0 });
});

// --- API PER GESTIRE LA CONFIGURAZIONE ---

app.get('/api/questions', (req, res) => {
    const questionsPath = path.join(__dirname, 'game-server/domande.json');
    fs.readFile(questionsPath, 'utf-8', (err, data) => {
        if (err) return res.status(500).send('Errore nel leggere le domande.');
        res.json(JSON.parse(data));
    });
});

app.get('/api/config', (req, res) => {
    fs.readFile(CONFIG_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).send('Errore nel leggere la configurazione.');
        res.json(JSON.parse(data));
    });
});

app.post('/api/config', (req, res) => {
    const newConfig = req.body;
    fs.writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2), (err) => {
        if (err) return res.status(500).send('Errore nel salvare la configurazione.');
        res.send('Configurazione salvata con successo.');
    });
});

io.on('connection', (socket) => {
    console.log('Pannello di controllo connesso.');
    socket.emit('status-change', { isRunning: Object.keys(runningProcesses).length > 0 });
});

server.listen(PORT, () => {
    console.log(`--- Cabina di Pilotaggio ATTIVA sulla porta ${PORT} ---`);
    console.log(`Apri il pannello di controllo per gestire il gioco.`);
});

process.on('exit', stopAllProcesses);
process.on('SIGINT', () => process.exit());
process.on('SIGUSR1', () => process.exit());
process.on('SIGUSR2', () => process.exit());