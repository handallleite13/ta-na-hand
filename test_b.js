const text1 = '新款Nike跑鞋';
console.log('Test 1 (Nike):', /\bNike\b/i.test(text1));

const text2 = '新款 dress 裙';
console.log('Test 2 (dress with spaces):', /\bdress\b/i.test(text2));

const text3 = '新款dress裙';
console.log('Test 3 (dress without spaces):', /\bdress\b/i.test(text3));

console.log('Test 4 (robe in strobel):', /\brobe\b/i.test('strobel'));
