const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /\}\s*const page = parseInt\(req\.query\.p\)/;

const sortingLogic = `}
      
      // PRIORITIZE ITEMS FROM THE CURRENT CATEGORY (without excluding globals)
      if (c && c !== 'todas') {
        const { lojas } = require('./scraper');
        const flattenGroup = (group) => {
          let list = [];
          for (let key in group) {
            if (Array.isArray(group[key])) list = list.concat(group[key]);
            else list = list.concat(flattenGroup(group[key]));
          }
          return list;
        };
        
        let targetDomains = [];
        const parts = c.split('_');
        if (parts.length === 1 && lojas[parts[0]]) {
           targetDomains = flattenGroup(lojas[parts[0]]);
        } else if (parts.length === 2 && lojas[parts[0]] && lojas[parts[0]][parts[1]]) {
           targetDomains = lojas[parts[0]][parts[1]];
        }
        
        if (targetDomains.length > 0) {
          // Sort matched items to the end of the array, so they appear FIRST when paginated/reversed
          resultados.sort((a, b) => {
             let aMatch = targetDomains.some(td => (a.domain || a.link || '').includes(td));
             let bMatch = targetDomains.some(td => (b.domain || b.link || '').includes(td));
             if (aMatch && !bMatch) return 1;
             if (!aMatch && bMatch) return -1;
             return 0;
          });
        }
      }
      
      const page = parseInt(req.query.p)`;

code = code.replace(regex, sortingLogic);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Search prioritization patched!');
