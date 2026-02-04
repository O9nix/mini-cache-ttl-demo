import { createRemoteStore } from 'mini-cache-ttl/client';

const cache = createRemoteStore('http://localhost:4000', 'test-store');

async function main() {
  console.log('=== Тест удалённого хранилища ===');

  await cache.set('x', 100, 60);
  console.log('set(x, 100) → ok');

  console.log('get(x):', await cache.get('x')); // 100

  console.log('has(x):', await cache.has('x')); // true

  await cache.update('x', 200);
  console.log('update(x, 200) → get(x):', await cache.get('x')); // 200

  await cache.touch('x', 120);
  console.log('touch(x, 120) → TTL обновлён');

  console.log('keys():', await cache.keys()); // ['x']
  console.log('size():', await cache.size()); // 1

  await cache.rename('x', 'y');
  console.log('rename(x → y) → get(y):', await cache.get('y')); // 200

  await cache.del('y');
  console.log('del(y) → get(y):', await cache.get('y')); // null

  await cache.set('z', 'temp');
  await cache.clear();
  console.log('clear() → keys():', await cache.keys()); // []

  console.log('✅ Все удалённые методы работают!');
}

main().catch(console.error);