const express = require('express');
const { status } = require('minecraft-server-util');
const app = express();

const servers = [
  { name: 'DunkinServer', host: 'DunkinServer.aternos.me', port: 25565 },
  { name: 'LifeStealShan', host: 'LifeStealShan.aternos.me', port: 25565 }
];

async function checkServer(server) {
  try {
    const result = await status(server.host, server.port, { timeout: 4000 });
    return { ...server, online: true, players: result.players.online, maxPlayers: result.players.max };
  } catch {
    return { ...server, online: false, players: 0, maxPlayers: 0 };
  }
}

app.get('/status', async (req, res) => {
  const data = await Promise.all(servers.map(checkServer));
  res.json(data);
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Server Status</title>
<style>
body{margin:0;font-family:sans-serif;background:#121212;color:#eee;display:flex;justify-content:center;align-items:center;height:100vh}
.container{display:flex;flex-direction:column;gap:20px}
.card{background:#1e1e1e;padding:20px;border-radius:12px;min-width:300px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 12px rgba(0,0,0,0.5)}
.name{font-size:1.2rem;font-weight:700}
.status{font-weight:700}
.online{color:#00ff99}
.offline{color:#ff3860}
.players{font-size:0.9rem;color:#aaa}
</style>
</head>
<body>
<div class="container" id="container"></div>
<script>
async function fetchStatus(){
  const r = await fetch('/status');
  const data = await r.json();
  const container = document.getElementById('container');
  container.innerHTML = '';
  data.forEach(s=>{
    const div = document.createElement('div');
    div.className='card';
    div.innerHTML=\`
      <div>
        <div class="name">\${s.name}</div>
        <div class="players">Players: \${s.players}/\${s.maxPlayers}</div>
      </div>
      <div class="status \${s.online?'online':'offline'}">\${s.online?'ONLINE':'OFFLINE'}</div>
    \`;
    container.appendChild(div);
  });
}
fetchStatus();
setInterval(fetchStatus,10000);
</script>
</body>
</html>`);
});

app.listen(3000, ()=>console.log('Running on http://localhost:3000'));
