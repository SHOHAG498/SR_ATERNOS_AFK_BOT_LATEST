const http = require('http');
const mineflayer = require('mineflayer');

// --- ১. HTTP Web Server (Render & Cron-job.org Monitoring) ---
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
const SERVER_HOST = 'srserver948.falix.me';
const SERVER_PORT = 25565;

function createBot() {
  console.log('[Bot] Connecting to Minecraft server as SR_AFK_Bot_1...');

  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: 'SR_AFK_Bot_1',
    version: '1.20.4',
    checkTimeoutInterval: 60000,
    connectTimeout: 45000
  });

  bot.on('spawn', () => {
    console.log('>>> [SUCCESS] SR_AFK_Bot_1 joined the server! <<<');

    // Anti-AFK: প্রতি ৫ সেকেন্ড পরপর হাত এবং মাথা নাড়াবে
    setInterval(() => {
      if (bot && bot.entity) {
        // ১. হাত নাড়ানো
        bot.swingArm('right');

        // ২. মাথা ঘুরানো (র্যান্ডম দিকে তাকাবে)
        const yaw = (Math.random() - 0.5) * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * Math.PI;
        bot.look(yaw, pitch, true);
      }
    }, 5000); // ৫০০০ মি.সে. = ৫ সেকেন্ড
  });

  // অটো-রিস্পন (মরে গেলে বেঁচে উঠবে)
  bot.on('death', () => {
    console.log('[Bot Alert] Bot died! Respawning...');
    bot.respawn();
  });

  // অটো-রিকানেক্ট (ডিসকানেক্ট হলে ৬ সেকেন্ড পর জয়েন করবে)
  bot.on('end', (reason) => {
    console.log(`[Bot Disconnected] Reason: ${reason}. Reconnecting in 6 seconds...`);
    setTimeout(createBot, 6000); // ৬০০০ মি.সে. = ৬ সেকেন্ড
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
