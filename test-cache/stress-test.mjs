#!/usr/bin/env node
// stress-test.mjs
import fetch from 'node-fetch';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    query: { type: 'string', short: 'q'},
    parquery: { type: 'string', short: 'l' },
    ttl: {type:'string', short:'t'}
  }
});




if (typeof fetch === 'undefined') {
  try {
    const { fetch } = await import('undici');
    globalThis.fetch = fetch;
  } catch (e) {
    console.error('Установите undici: npm install undici');
    process.exit(1);
  }
}

const SERVER_URL = 'http://localhost:4000';
const STORE_ID = 'stress-test';
const TOTAL_REQUESTS = Number(values.query) || 100000;
const CONCURRENT = Number(values.parquery) || 100;

const TTL = values.ttl || 60;

let successCount = 0;
let errorCount = 0;

function randomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function randomValue() {
  const type = Math.floor(Math.random() * 4);
  switch (type) {
    case 0: return randomString(20);
    case 1: return Math.floor(Math.random() * 10000);
    case 2: return { id: randomString(8),  data: randomString(50), tags: [randomString(5), randomString(5)] };
    case 3: return [randomString(10), randomString(10), Math.random()];
    default: return 'default';
  }
}

async function performOperation(index,retries=3) {
  try {
    const key = `key_${index}`;
    const value = randomValue();

    //измените ttl на фиксирванное время указывается в секундах (60 - это 60 секунд)
    let ttl=60;
if (TTL === "r") {
  ttl = Math.floor(Math.random() * 10000);
} else {
  ttl = Number(TTL); // ← приведение к числу!
}
   

    const setRes = await fetch(`${SERVER_URL}/stores/${STORE_ID}/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, ttlSec: ttl })
    });

    if (!setRes.ok) throw new Error(`SET failed: ${setRes.status}`);

    const getRes = await fetch(`${SERVER_URL}/stores/${STORE_ID}/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });

    if (!getRes.ok) throw new Error(`GET failed: ${getRes.status}`);

    successCount++;
  } catch (err) {
      if (retries > 0) {
      await new Promise(r => setTimeout(r, 10)); // пауза
      return performOperation(index, retries - 1);
    }
    errorCount++;
    console.error(`Ошибка в операции ${index}:`, err.message);
  }
}

async function runStressTest() {
  console.log(`🚀 Запуск нагрузочного теста...`);
  console.log(`   Сервер: ${SERVER_URL}`);
  console.log(`   Хранилище: ${STORE_ID}`);
  console.log(`   Операций: ${TOTAL_REQUESTS}`);
  console.log(`   Параллельно: ${CONCURRENT}\n`);
   console.log(`   TTL: ${TTL}`);
  const start = Date.now();

  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENT) {
    const batch = [];
    for (let j = 0; j < CONCURRENT && (i + j) < TOTAL_REQUESTS; j++) {
      batch.push(performOperation(i + j));
    }
    await Promise.all(batch);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const rps = (successCount + errorCount) / elapsed;
    console.log(
      `📊 Выполнено: ${successCount + errorCount}/${TOTAL_REQUESTS} | ` +
      `Успехов: ${successCount} | Ошибок: ${errorCount} | RPS: ${rps.toFixed(1)}`
    );
  }

  const duration = (Date.now() - start) / 1000;
  const finalRps = TOTAL_REQUESTS / duration;

  console.log(`\n✅ Тест завершён!`);
    console.log(`   Сервер: ${SERVER_URL}`);
  console.log(`   Хранилище: ${STORE_ID}`);
  console.log(`   Операций: ${TOTAL_REQUESTS}`);
  console.log(`   Параллельно: ${CONCURRENT}\n`);
  console.log(`⏱️  Время: ${duration.toFixed(2)} сек`);
  console.log(`📈 Скорость: ${finalRps.toFixed(1)} запросов/сек`);
  console.log(`✅ Успешно: ${successCount}`);
  console.log(`❌ Ошибок: ${errorCount}`);
}

runStressTest().catch(console.error);