const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /\/\/ Filtro de Busca Multilingue Inteligente[\s\S]*?resultados = resultados\.filter\(item => \{[\s\S]*?return variants\.some\(v => titulo\.includes\(v\)\);\s*\}\);\s*\}\);/;

const newLogic = `// Filtro de Busca Multilingue Inteligente
      if (query) {
        let q = query;
        // Tratamento de frases multi-palavras antes de separar por espaço
        q = q.replace(/all blacks/g, 'all_blacks');
        q = q.replace(/all black/g, 'all_black');
        
        const stopWords = ['de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'em', 'um', 'uma'];
        const keywords = q.split(' ').filter(k => k.length > 1 && !stopWords.includes(k));
        
        const customSynonyms = {
          'urss': ['ussr', 'soviet', 'cccp'],
          'eua': ['usa', 'united states', 'american'],
          'holanda': ['netherlands', 'dutch', 'holland'],
          'inglaterra': ['england', 'english'],
          'espanha': ['spain', 'españa', 'spanish'],
          'alemanha': ['germany', 'deutschland', 'german'],
          'italia': ['italy', 'italian'],
          'franca': ['france', 'français', 'french'],
          'japao': ['japan', 'japanese'],
          'mexico': ['mexico', 'mexican'],
          'brasil': ['brazil', 'brazilian'],
          'camaroes': ['cameroon'],
          'dinamarca': ['denmark', 'danish'],
          'escocia': ['scotland', 'scottish'],
          'suecia': ['sweden', 'swedish'],
          'suica': ['switzerland', 'swiss'],
          'croacia': ['croatia', 'croatian'],
          'servia': ['serbia', 'serbian'],
          'marrocos': ['morocco', 'moroccan'],
          'palestina': ['palestine', 'palestinian'],
          'palestine': ['palestina', 'palestinian'],
          'argelia': ['algeria', 'algerian'],
          'egito': ['egypt', 'egyptian'],
          'grecia': ['greece', 'greek'],
          'turquia': ['turkey', 'turkish'],
          'belgica': ['belgium', 'belgian'],
          'uruguai': ['uruguay', 'uruguayan'],
          'colombia': ['colombia', 'colombian'],
          'chile': ['chile', 'chilean'],
          'equador': ['ecuador', 'ecuadorian'],
          'peru': ['peru', 'peruvian'],
          'venezuela': ['venezuela', 'venezuelan'],
          'paraguai': ['paraguay', 'paraguayan'],
          'bolivia': ['bolivia', 'bolivian'],
          'canada': ['canada', 'canadian'],
          'australia': ['australia', 'australian'],
          'coreia': ['korea', 'korean'],
          'spfc': ['sao paulo', 'são paulo'],
          'fla': ['flamengo'],
          'flu': ['fluminense'],
          'timao': ['corinthians'],
          'verdao': ['palmeiras'],
          'galo': ['atletico mineiro'],
          'inter': ['internacional', 'inter milan', 'internazionale'],
          'all_blacks': ['new_zealand', 'zealand', 'all_black'],
          'all_black': ['all_black']
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
              const resEn = await translate(kw.replace(/_/g, ' '), {to: 'en'});
              if (resEn && resEn.text) kwVariants.push(resEn.text.toLowerCase().replace(/ /g, '_'));
            } catch(e) {}
            
            // Translate to Chinese (Original Yupoo language)
            try {
              const resZh = await translate(kw.replace(/_/g, ' '), {to: 'zh-CN'});
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
        }
  
        resultados = resultados.filter(item => {
          const titulo = (item.titulo || '').toLowerCase();
          
          return translatedKeywords.every(variants => {
            return variants.some(v => titulo.includes(v.replace(/_/g, ' ')));
          });
        });`;

code = code.replace(regex, newLogic);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Search Logic Updated for All Blacks!');
