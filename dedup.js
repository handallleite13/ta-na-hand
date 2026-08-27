const fs = require('fs');

const files = fs.readdirSync(__dirname).filter(f => f.startsWith('catalogo') && f.endsWith('.json'));
let allItems = [];

for (const f of files) {
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    allItems = allItems.concat(data);
}

const beforeCount = allItems.length;

// Remove duplicates based on link split &
const uniqueMap = new Map();
for (const item of allItems) {
    const key = item.link.split('&')[0];
    
    if (uniqueMap.has(key)) {
        // If we already have it, but the new one has a category and the old one doesn't, upgrade it
        const existing = uniqueMap.get(key);
        if (!existing.yupoo_category_name && item.yupoo_category_name) {
            existing.yupoo_category_name = item.yupoo_category_name;
        }
    } else {
        uniqueMap.set(key, item);
    }
}

const uniqueItems = Array.from(uniqueMap.values());
const afterCount = uniqueItems.length;
console.log(`Deduplicated: ${beforeCount} -> ${afterCount}`);

// Save back in chunks
const CHUNK_SIZE = 50000;
let chunkCount = 1;
for (let i = 0; i < uniqueItems.length; i += CHUNK_SIZE) {
    const chunk = uniqueItems.slice(i, i + CHUNK_SIZE);
    fs.writeFileSync(`catalogo_${chunkCount}.json`, JSON.stringify(chunk), 'utf8');
    chunkCount++;
}

// Delete extra chunks if any
for (let i = chunkCount; i <= files.length; i++) {
    if (fs.existsSync(`catalogo_${i}.json`)) {
        fs.unlinkSync(`catalogo_${i}.json`);
    }
}
