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
<title>Shan's Ultimate Server Dashboard</title>
<style>
body{margin:0;font-family:sans-serif;background:#121212;color:#eee;display:flex;justify-content:center;align-items:flex-start;padding:20px;min-height:100vh;flex-direction:column}
h1{font-weight:700;text-align:center;margin-bottom:20px;color:#00ff99;font-size:2rem}
.ad{padding:15px;border-radius:12px;margin:15px auto;max-width:600px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.5)}
.ad.aternos{background:#222;color:#fff}
.ad.exaroton{background:#1a6f1a;color:#fff;font-weight:700}
.container{display:flex;flex-wrap:wrap;gap:20px;justify-content:center}
.card{background:#1e1e1e;padding:20px;border-radius:12px;min-width:280px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;box-shadow:0 4px 12px rgba(0,0,0,0.5);transition:transform 0.3s,max-height 0.3s;overflow:hidden;cursor:pointer}
.card:hover{transform:translateY(-5px)}
.name{font-size:1.3rem;font-weight:700}
.status{font-weight:700;margin-top:5px}
.online{color:#00ff99}
.offline{color:#ff3860}
.players{font-size:0.9rem;color:#aaa;margin-top:5px}
.button{margin-top:10px;padding:6px 12px;background:#00ff99;color:#121212;border:none;border-radius:8px;cursor:pointer;font-weight:700;transition:background 0.2s}
.button:hover{background:#00cc7a}
.info{font-size:0.85rem;color:#bbb;margin-top:5px}
.more{margin-top:10px;font-size:0.85rem;color:#ccc;display:none;flex-direction:column;gap:4px}
.more div{line-height:1.3}
</style>
</head>
<body>
<h1>Shan's Ultimate Minecraft Dashboard</h1>

<div class="ad aternos">
<strong>Aternos:</strong> Free Minecraft servers for you and your friends! <a href="https://aternos.org" style="color:#00ff99;text-decoration:none">Visit Aternos</a>
</div>
<div class="ad exaroton">
<strong>Exaroton:</strong> Paid premium Minecraft servers with low latency! <a href="https://exaroton.com" style="color:#b3ffb3;text-decoration:none">Visit Exaroton</a>
</div>

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
      <div class="name">\${s.name}</div>
      <div class="status \${s.online?'online':'offline'}">\${s.online?'ONLINE':'OFFLINE'}</div>
      <div class="players">Players: \${s.players}/\${s.maxPlayers}</div>
      <div class="info">\${s.info}</div>
      <button class="button" onclick="showMore(this)">Show More Info</button>
      <div class="more">
        <div>IP: \${s.host}</div>
        <div>Port: \${s.port}</div>
        <div>Software: \${s.software || 'Unknown'}</div>
        <div>Version: \${s.version || 'Unknown'}</div>
        <div>Type: \${s.type}</div>
        <div>Bedrock Compatible: \${s.bedrockCompatible}</div>
      </div>
    \`;
    container.appendChild(div);
  });
}

function showMore(btn){
  const moreDiv = btn.nextElementSibling;
  if(moreDiv.style.display==='flex'){
    moreDiv.style.display='none';
    btn.textContent='Show More Info';
  } else {
    moreDiv.style.display='flex';
    btn.textContent='Hide Info';
  }
}

fetchStatus();
setInterval(fetchStatus,10000);
</script>
</body>
</html>`);
});

app.listen(3000, ()=>console.log('Running on http://localhost:3000'));
