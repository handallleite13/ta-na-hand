const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
const fitnessBlocks = [];
lines.forEach((l, i) => { if (l.includes("if (c && c.startsWith('fitness')) {")) fitnessBlocks.push(i); });
console.log('Fitness blocks at:', fitnessBlocks);
if (fitnessBlocks.length > 0) {
    console.log('Block 1:');
    console.log(lines.slice(fitnessBlocks[0]-2, fitnessBlocks[0]+20).join('\n'));
    if (fitnessBlocks.length > 1) {
        console.log('Block 2:');
        console.log(lines.slice(fitnessBlocks[1]-2, fitnessBlocks[1]+20).join('\n'));
    }
}
