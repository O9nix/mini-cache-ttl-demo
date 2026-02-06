// cache-server/server.js
import { createApp } from 'mini-cache-ttl/server';
import { monitor } from 'mini-cache-ttl/monitor';

const { app, stores } = createApp();

// Подключаем мониторинг
monitor(app, { stores });

app.listen(4000, () => {
  console.log('✅ Кэш-сервер с мониторингом запущен на http://localhost:4000');
});