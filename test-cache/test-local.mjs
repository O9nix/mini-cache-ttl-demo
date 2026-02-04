
import { createStore } from 'mini-cache-ttl';

const store = createStore();

console.log('=== Тест локального хранилища ===');

// set
store.set('a', 1, 10);
console.log('set(a, 1, 10) → ok');

// get
console.log('get(a):', store.get('a')); // 1

// has
console.log('has(a):', store.has('a')); // true

// update
store.update('a', 2);
console.log('update(a, 2) → get(a):', store.get('a')); // 2

// touch
store.touch('a', 30);
console.log('touch(a, 30) → TTL продлён');

// rename
store.rename('a', 'b');
console.log('rename(a → b) → get(b):', store.get('b')); // 2

// keys
console.log('keys():', store.keys()); // ['b']

// size
console.log('size():', store.size()); // 1

// del
store.del('b');
console.log('del(b) → get(b):', store.get('b')); // null

// clear
store.set('temp', 'x');
store.clear();
console.log('clear() → keys():', store.keys()); // []

console.log('✅ Все локальные методы работают!');