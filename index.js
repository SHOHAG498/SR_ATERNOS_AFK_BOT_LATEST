const http = require('http');
const mineflayer = require('mineflayer');

// --- ১. HTTP Web Server & Bot Status Tracking ---
const PORT = process.env.PORT || 10000;

// বটের জয়েন স্ট্যাটাস ট্র্যাক করার অবজেক্ট
const botStatuses = {
  'Server_1_Bot': 'not joined',
  'Server_2_Bot': 'not joined'
};

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    // URL-এ শুধু বটের নাম এবং joined/not joined দেখাবে
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
    host: 'SRSHOHAG27-KgbZ.aternos.me', // প্রথম সার্ভারের IP
    port: 48821,                       // প্রথম সার্ভারের Port
    username: 'MODERATOR',             // ইউজারনেম
    uuid: '11111111-2222-3333-4444-555555555555', // ইউনিক UUID
    version: '1.20.4'
  },
  {
    name: 'Server_2_Bot',
    host: 'SRSHOHAG27-duKW.aternos.me', // দ্বিতীয় সার্ভারের IP[cite: 8]
    port: 28337,                       // দ্বিতীয় সার্ভারের Port[cite: 8]
    username: 'MODERATOR',             // ইউজারনেম
    uuid: '99999999-8888-7777-6666-555555555555', // ইউনিক UUID
    version: '1.20.4'
  }
];

function createBot(config) {
  console.log(`[Bot] Connecting ${config.name} (${config.username}) to ${config.host}:${config.port}...`);

  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    uuid: config.uuid,
    version: config.version
  });

  bot.on('spawn', () => {
    console.log(`>>> [SUCCESS] ${config.name} (${config.username}) joined ${config.host} successfully! <<<`);
    botStatuses[config.name] = 'joined'; // সার্ভারে ঢুকলে 'joined' হবে

    // Anti-AFK Swing Arm (প্রতি ২০ সেকেন্ড পর পর)
    setInterval(() => {
      if (bot && bot.entity) {
        bot.swingArm('right');
      }
    }, 20000);
  });

  bot.on('end', (reason) => {
    console.log(`[${config.name} Disconnected] Reason: ${reason}. Reconnecting in 15 seconds...`);
    botStatuses[config.name] = 'not joined'; // ডিসকানেক্ট হলে 'not joined' হবে
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

// Start Both Bots Simultaneously
botsConfig.forEach(config => {
  createBot(config);
});
