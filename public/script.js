// script.js
document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocket('ws://localhost:3000');
  
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'update') {
        loadParties();
      } else if (message.type === 'chat') {
        displayChatMessage(message);
      }
    };
  
    document.getElementById('createPartyForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());
      await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      event.target.reset();
    });
  
    document.getElementById('chatForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const messageInput = document.getElementById('chatMessage');
      const message = messageInput.value.trim();
      if (message) {
        ws.send(JSON.stringify({ type: 'chat', message }));
        messageInput.value = '';
      }
    });
  
    function displayChatMessage(message) {
      const chatMessages = document.getElementById('chatMessages');
      const messageElement = document.createElement('div');
      messageElement.textContent = message.message;
      chatMessages.appendChild(messageElement);
    }
  
    async function loadParties() {
      const response = await fetch('/api/parties');
      const parties = await response.json();
      const list = document.getElementById('partyList');
      list.innerHTML = '';
      parties.forEach(party => {
        const item = document.createElement('li');
        item.textContent = `${party.nom} - ${party.date} ${party.heure}`;
        if (party.terminee) {
          item.style.color = 'gray';
        } else {
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Supprimer';
          deleteBtn.addEventListener('click', async () => {
            await fetch(`/api/parties/${party.id}`, { method: 'DELETE' });
            loadParties();
          });
          const finishBtn = document.createElement('button');
          finishBtn.textContent = 'Terminer';
          finishBtn.addEventListener('click', async () => {
            await fetch(`/api/parties/${party.id}/terminer`, { method: 'PUT' });
            loadParties();
          });
          item.appendChild(deleteBtn);
          item.appendChild(finishBtn);
        }
        list.appendChild(item);
      });
      document.getElementById('count').textContent = parties.filter(p => !p.terminee).length;
    }
  
    loadParties();
  });
  