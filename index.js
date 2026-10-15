const http = require('http');
const mineflayer = require('mineflayer');

// --- 1. HTTP Web Server (Render & Cron-job.org Monitoring) ---
const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'OK', 
      message: 'Render SR AFK Bot Active!', 
      uptime: Math.floor(process.uptime()) + ' seconds' 
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[HTTP Server] Bot web monitor running on port ${PORT}`);
});

// --- 2. Minecraft Bot Config & Logic ---
const SERVER_HOST = 'SRSHOHAG27.aternos.me';
const SERVER_PORT = 28030;

function createBot() {
  console.log('[Bot] Connecting to Minecraft server as MODERATOR...');

  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: 'MODERATOR',
    version: false, // Auto-detect Minecraft version
    auth: 'offline'
  });

  bot.on('spawn', () => {
    console.log('>>> [SUCCESS] MODERATOR joined the server! <<<');

    // Spectator mode automatic command
    setTimeout(() => {
      bot.chat('/gamemode spectator MODERATOR');
    }, 3000);

    // Anti-AFK Swing Arm (20 seconds)
    setInterval(() => {
      if (bot && bot.entity) {
        bot.swingArm('right');
      }
    }, 20000);
  });

  // Auto-respawn logic
  bot.on('death', () => {
    console.log('[Bot Alert] MODERATOR has died! Respawning...');
    bot.respawn();
  });

  bot.on('end', (reason) => {
    console.log(`[Bot Disconnected] Reason: ${reason}. Reconnecting in 15 seconds...`);
    setTimeout(createBot, 15000);
  });

  bot.on('error', (err) => {
    console.log('[Bot Error]', err.message);
  });
}

// Global System Handlers
process.on('uncaughtException', (err) => {
  console.error('[System Alert] Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[System Alert] Unhandled Rejection:', reason);
});

// Start Bot
createBot();
