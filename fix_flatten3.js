const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /const flattenGroup = \(group\) => \{\s+let list = \[\];[\s\S]*?return list;\s+\};/g;
const replacement = `const flattenGroup = (group) => {
          if (!group) return [];
          if (Array.isArray(group)) return group;
          let list = [];
          for (let key in group) {
            if (Array.isArray(group[key])) list = list.concat(group[key]);
            else if (typeof group[key] === 'object') list = list.concat(flattenGroup(group[key]));
          }
          return list;
        };`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed second flattenGroup!');
