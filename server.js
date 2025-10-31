const express = require('express');
const { status } = require('minecraft-server-util');
const app = express();

const servers = [
  { name: 'DunkinServer', host: 'DunkinServer.aternos.me', port: 17634, info: "Shan's personal server with friends", bedrockCompatible: false },
  { name: 'LifeStealShan', host: 'LifeStealShan.aternos.me', port: 47881, info: "Shan's Lifesteal server", bedrockCompatible: false }
];

async function checkServer(server) {
  try {
    const result = await status(server.host, server.port, { timeout: 4000 });
    return { 
      ...server, 
      online: true, 
      players: result.players.online, 
      maxPlayers: result.players.max, 
      version: result.version.name, 
      software: result.version.protocol === 755 ? 'Purpur' : 'Java', 
      type: 'Java'
    };
  } catch {
    return { 
      ...server, 
      online: false, 
      players: 0, 
      maxPlayers: 0, 
      version: null, 
      software: null, 
      type: 'Java' 
    };
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
<title>Shan's Ultimate Minecraft Dashboard</title>
<style>
body{margin:0;font-family:sans-serif;background:#0d0d0d;color:#eee;display:flex;flex-direction:column;align-items:center;min-height:100vh;}
h1{margin-top:20px;text-align:center;font-size:2.2rem;color:#00ff99;}
.ads{display:flex;flex-direction:column;gap:10px;width:90%;max-width:800px;margin:20px 0;}
.ad{padding:15px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.5);text-align:center;font-weight:700;}
.ad.aternos{background:#222;color:#fff;}
.ad.exaroton{background:#1a6f1a;color:#fff;}
.container{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;width:90%;max-width:1000px;margin-bottom:50px;}
.card{background:#1e1e1e;padding:20px;border-radius:12px;display:flex;flex-direction:column;gap:10px;box-shadow:0 4px 12px rgba(0,0,0,0.5);transition:transform 0.3s;cursor:pointer;}
.card:hover{transform:translateY(-5px)}
.name{font-size:1.3rem;font-weight:700;}
.status{font-weight:700;}
.online{color:#00ff99;}
.offline{color:#ff3860;}
.players{font-size:0.9rem;color:#aaa;}
.button{padding:8px 14px;background:#00ff99;color:#121212;border:none;border-radius:8px;font-weight:700;cursor:pointer;transition:background 0.2s;}
.button:hover{background:#00cc7a;}
.modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:none;justify-content:center;align-items:center;z-index:100;}
.modal-content{background:#1e1e1e;padding:30px;border-radius:12px;max-width:500px;width:90%;position:relative;box-shadow:0 4px 20px rgba(0,0,0,0.7);}
.close{position:absolute;top:10px;right:15px;font-size:1.5rem;font-weight:bold;color:#fff;cursor:pointer;}
.detail{margin-top:10px;color:#ccc;line-height:1.5;}
</style>
</head>
<body>
<h1>Shan's Ultimate Minecraft Dashboard</h1>

<div class="ads">
  <div class="ad aternos">Aternos: Free Minecraft servers! <a href="https://aternos.org" style="color:#00ff99;text-decoration:none">Visit Aternos</a></div>
  <div class="ad exaroton">Exaroton: Paid premium Minecraft servers! <a href="https://exaroton.com" style="color:#b3ffb3;text-decoration:none">Visit Exaroton</a></div>
</div>

<div class="container" id="container"></div>

<div class="modal" id="modal">
  <div class="modal-content" id="modalContent">
    <span class="close" onclick="closeModal()">&times;</span>
    <div id="modalBody"></div>
  </div>
</div>

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
      <div class="name">\${s.name}</div>
      <div class="status \${s.online?'online':'offline'}">\${s.online?'ONLINE':'OFFLINE'}</div>
      <div class="players">Players: \${s.players}/\${s.maxPlayers}</div>
      <div class="info">\${s.info}</div>
      <button class="button" onclick="showModal(\${JSON.stringify(s).replace(/"/g,'&quot;')})">Show Info</button>
    \`;
    container.appendChild(div);
  });
}

function showModal(server){
  const modal = document.getElementById('modal');
  const body = document.getElementById('modalBody');
  body.innerHTML = \`
    <h2 style="color:#00ff99">\${server.name}</h2>
    <div class="detail">Status: <span class="\${server.online?'online':'offline'}">\${server.online?'ONLINE':'OFFLINE'}</span></div>
    <div class="detail">Players: \${server.players}/\${server.maxPlayers}</div>
    <div class="detail">IP: \${server.host}</div>
    <div class="detail">Port: \${server.port}</div>
    <div class="detail">Software: \${server.software || 'Unknown'}</div>
    <div class="detail">Version: \${server.version || 'Unknown'}</div>
    <div class="detail">Type: \${server.type}</div>
    <div class="detail">Bedrock Compatible: \${server.bedrockCompatible}</div>
    <div class="detail">Info: \${server.info}</div>
  \`;
  modal.style.display='flex';
}

function closeModal(){
  document.getElementById('modal').style.display='none';
}

window.onclick = function(event){
  const modal = document.getElementById('modal');
  if(event.target==modal) closeModal();
}

fetchStatus();
setInterval(fetchStatus,10000);
</script>

</body>
</html>`);
});

app.listen(3000, ()=>console.log('Running on http://localhost:3000'));
