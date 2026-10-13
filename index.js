const http = require('http');
const mineflayer = require('mineflayer');

// --- ১. HTTP Web Server & Bot Status Tracking ---
const PORT = process.env.PORT || 10000;

const botStatuses = {
  'Server_1_Bot': 'not joined',
  'Server_2_Bot': 'not joined'
};

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      Server_1_Bot: botStatuses['Server_1_Bot'],
      Server_2_Bot: botStatuses['Server_2_Bot']
    }, null, 2));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[HTTP Server] Bot web monitor running on port ${PORT}`);
});

// --- ২. Two Different Servers Bot Configuration & Logic ---
const botsConfig = [
  {
    name: 'Server_1_Bot',
    host: 'SRSHOHAG27-KgbZ.aternos.me',
    port: 48821,
    username: 'MODERATOR',
    version: false // Auto version detect
  },
  {
    name: 'Server_2_Bot',
    host: 'SRSHOHAG27.aternos.me',
    port: 62744,
    username: 'MODERATOR',
    version: false // Auto version detect
  }
];

function createBot(config) {
  console.log(`[Bot] Connecting ${config.name} (${config.username}) to ${config.host}:${config.port}...`);

  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version,
    checkTimeoutInterval: 60000
  });

  bot.on('spawn', () => {
    console.log(`>>> [SUCCESS] ${config.name} (${config.username}) joined ${config.host} successfully! <<<`);
    botStatuses[config.name] = 'joined';

    // Anti-AFK Swing Arm
    setInterval(() => {
      if (bot && bot.entity) {
        bot.swingArm('right');
      }
    }, 20000);
  });

  bot.on('end', (reason) => {
    console.log(`[${config.name} Disconnected] Reason: ${reason}. Reconnecting in 15 seconds...`);
    botStatuses[config.name] = 'not joined';
    setTimeout(() => createBot(config), 15000);
  });

  bot.on('error', (err) => {
    console.log(`[${config.name} Error]`, err.message);
    botStatuses[config.name] = 'not joined';
  });
}

// Global System Handlers
process.on('uncaughtException', (err) => {
  console.error('[System Alert] Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[System Alert] Unhandled Rejection:', reason);
});

// Start Both Bots
botsConfig.forEach(config => {
  createBot(config);
});
