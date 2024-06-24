// server.js
const express = require('express');
const pool = require('./database');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('public'));

// API Endpoints

// Récupérer toutes les parties
app.get('/api/parties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM parties');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des parties', err);
    res.sendStatus(500);
  }
});

// Créer une nouvelle partie
app.post('/api/parties', async (req, res) => {
  const { nom, date, heure, joueurs } = req.body;
  try {
    await pool.query('INSERT INTO parties (nom, date, heure, joueurs) VALUES ($1, $2, $3, $4)', [nom, date, heure, joueurs]);
    notifyClients({ type: 'update' });
    res.sendStatus(201);
  } catch (err) {
    console.error('Erreur lors de la création de la partie', err);
    res.sendStatus(500);
  }
});

// Supprimer une partie
app.delete('/api/parties/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM parties WHERE id = $1', [id]);
    notifyClients({ type: 'update' });
    res.sendStatus(204);
  } catch (err) {
    console.error('Erreur lors de la suppression de la partie', err);
    res.sendStatus(500);
  }
});

// Terminer une partie
app.put('/api/parties/:id/terminer', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE parties SET terminee = TRUE WHERE id = $1', [id]);
    notifyClients({ type: 'update' });
    res.sendStatus(200);
  } catch (err) {
    console.error('Erreur lors de la terminaison de la partie', err);
    res.sendStatus(500);
  }
});

// WebSocket pour la propagation en temps réel (incluant le chat)
function notifyClients(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

wss.on('connection', ws => {
  console.log('Client connecté');

  ws.on('message', message => {
    // Réception d'un message du client
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === 'chat') {
      // Envoyer le message à tous les clients connectés
      notifyClients(parsedMessage);
    }
  });
});

server.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});
