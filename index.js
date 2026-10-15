const http = require('http');
const mineflayer = require('mineflayer');

// --- ১. HTTP Web Server (Render & Keep-Alive Monitoring) ---
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

// --- ২. Minecraft Bot Config & Logic ---
function createBot() {
  console.log('[Bot] Connecting to Minecraft server as MODERATOR...');

  const bot = mineflayer.createBot({
    host: 'SRSHOHAG27.aternos.me', // মূল Aternos Domain (SRV Auto-Lookup)
    username: 'MODERATOR',
    version: false,                 // Auto-detect version
    auth: 'offline'                 // Cracked server support
  });

  bot.on('spawn', () => {
    console.log('>>> [SUCCESS] MODERATOR joined the server! <<<');

    // Auto spectator mode command
    setTimeout(() => {
      bot.chat('/gamemode spectator MODERATOR');
    }, 3000);

    // Anti-AFK Swing Arm (২০ সেকেন্ড পর পর)
    setInterval(() => {
      if (bot && bot.entity) {
        bot.swingArm('right');
      }
    }, 20000);
  });

  // Auto-respawn logic
  bot.on('death', () => {
    console.log('[Bot Alert] MODERATOR died! Respawning...');
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
