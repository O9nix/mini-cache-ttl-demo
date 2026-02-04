// cache-server/server.js
import { createServer } from 'mini-cache-ttl/server';

// Запускаем общий кэш на порту 4000
createServer({ port: 4000 })
  .then(() => {
    console.log('✅ Общий кэш запущен на http://localhost:4000');
  })
  .catch(err => {
    console.error('❌ Ошибка:', err);
    process.exit(1);
  });