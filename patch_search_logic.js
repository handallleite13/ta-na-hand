const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const searchRegex = /\/\/ Filtro de Busca Multilingue Inteligente[\s\S]*?translatedKeywords\.push\(kwVariants\);\s*\}\s*\}\s*catch\(e\)\s*\{\s*translatedKeywords\s*=\s*keywords\.map\(kw\s*=>\s*\[kw\]\);\s*\}/;

const newSearchLogic = `// Filtro de Busca Multilingue Inteligente
    if (query) {
      const stopWords = ['de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'em', 'um', 'uma'];
      const keywords = query.split(' ').filter(k => k.length > 1 && !stopWords.includes(k));
      
      const customSynonyms = {
        'urss': ['ussr', 'soviet', 'cccp'],
        'eua': ['usa', 'united states'],
        'holanda': ['netherlands', 'dutch'],
        'inglaterra': ['england'],
        'espanha': ['spain'],
        'alemanha': ['germany'],
        'italia': ['italy'],
        'franca': ['france', 'français'],
        'japao': ['japan'],
        'mexico': ['mexico'],
        'brasil': ['brazil'],
        'camaroes': ['cameroon'],
        'dinamarca': ['denmark'],
        'escocia': ['scotland'],
        'suecia': ['sweden'],
        'suica': ['switzerland'],
        'croacia': ['croatia'],
        'servia': ['serbia'],
        'marrocos': ['morocco'],
        'spfc': ['sao paulo', 'são paulo'],
        'fla': ['flamengo'],
        'flu': ['fluminense'],
        'timao': ['corinthians'],
        'verdao': ['palmeiras'],
        'galo': ['atletico mineiro'],
        'inter': ['internacional', 'inter milan', 'internazionale']
      };

      let translatedKeywords = [];
      try {
        const translate = require('google-translate-api-x');
        for (let kw of keywords) {
          let kwVariants = [kw];
          
          // Apply custom synonyms
          if (customSynonyms[kw]) {
            kwVariants = kwVariants.concat(customSynonyms[kw]);
          }

          // Translate to English (Most common for retro shirts and names)
          try {
            const resEn = await translate(kw, {to: 'en'});
            if (resEn && resEn.text) kwVariants.push(resEn.text.toLowerCase());
          } catch(e) {}
          
          // Translate to Chinese (Original Yupoo language)
          try {
            const resZh = await translate(kw, {to: 'zh-CN'});
            if (resZh && resZh.text) kwVariants.push(resZh.text.toLowerCase());
          } catch(e) {}
          
          // Remove duplicates
          kwVariants = [...new Set(kwVariants)];
          translatedKeywords.push(kwVariants);
        }
      } catch(e) {
        translatedKeywords = keywords.map(kw => {
          let variants = [kw];
          if (customSynonyms[kw]) variants = variants.concat(customSynonyms[kw]);
          return variants;
        });
      }`;

code = code.replace(searchRegex, newSearchLogic);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Search Logic Updated');
