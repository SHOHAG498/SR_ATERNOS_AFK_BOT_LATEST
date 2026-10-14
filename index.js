const http = require('http');
const mineflayer = require('mineflayer');

// --- ১. HTTP Web Server & Bot Status Tracking ---
const PORT = process.env.PORT || 10000;

let botStatus = 'not joined';

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: botStatus,
      server: 'SRJavaBE.aternos.me:32953'
    }, null, 2));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[HTTP Server] Bot web monitor running on port ${PORT}`);
});

// --- ২. Single Server Bot Configuration & Logic ---
const botConfig = {
  name: 'SR_AFK_Bot',
  host: 'SRJavaBE.aternos.me',
  port: 32953,
  username: 'MODERATOR',
  version: false // Auto version detect
};

function createBot() {
  console.log(`[Bot] Connecting ${botConfig.name} (${botConfig.username}) to ${botConfig.host}:${botConfig.port}...`);

  const bot = mineflayer.createBot({
    host: botConfig.host,
    port: botConfig.port,
    username: botConfig.username,
    version: botConfig.version,
    checkTimeoutInterval: 60000
  });

  bot.on('spawn', () => {
    console.log(`>>> [SUCCESS] ${botConfig.name} (${botConfig.username}) joined ${botConfig.host} successfully! <<<`);
    botStatus = 'joined';

    // Anti-AFK Swing Arm
    setInterval(() => {
      if (bot && bot.entity) {
        bot.swingArm('right');
      }
    }, 20000);
  });

  bot.on('end', (reason) => {
    console.log(`[${botConfig.name} Disconnected] Reason: ${reason}. Reconnecting in 5 seconds...`);
    botStatus = 'not joined';
    setTimeout(() => createBot(), 5000); // ৫ সেকেন্ডের মধ্যে রি-জয়েন করবে
  });

  bot.on('error', (err) => {
    console.log(`[${botConfig.name} Error]`, err.message);
    botStatus = 'not joined';
  });
}

// Global System Handlers
process.on('uncaughtException', (err) => {
  console.error('[System Alert] Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[System Alert] Unhandled Rejection:', reason);
});

// Start Single Bot
createBot();
