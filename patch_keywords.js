const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const oldKeywords = `sportKeywords = {
  basquete: /nba|lakers|bulls|celtics|warriors|heat|knicks|nets|mavericks|suns|bucks|sixers|nuggets|curry|lebron|kobe|durant|篮球|basketball|jordan|湖人|勇士|公牛|凯尔特人|热火|尼克斯|篮网|独行侠|太阳|雄鹿|76人|掘金/i,
  futebol_americano: /nfl|chiefs|eagles|patriots|ravens|49ers|packers|cowboys|steelers|dolphins|broncos|raiders|seahawks|buccaneers|橄榄球|super bowl|海鹰|包装工|49人|野马|突袭者|酋长|老鹰|爱国者|乌鸦|牛仔|钢人|海豚|海盗/i,
  beisebol: /mlb|baseball|yankees|dodgers|red sox|braves|astros|cubs|mets|padres|phillies|rangers|棒球|扬基|道奇|红袜|勇士|太空人|小熊|大都会|教士|费城人|游骑兵/i,
  automobilismo: /\\bf1\\b|formula 1|formula one|racing|ferrari|mercedes|red\\s?bull|mclaren|aston martin|porsche|bmw motorsport|amg|petronas|nascar|motogp|yamaha|车队|赛车/i,
  rugby: /rugby|sevens|all blacks?|sydney rooster|nrl|brumbies|crusaders|hurricanes/i
};`;

// 1. Basquete gets '勇士' (Warriors) and '老鹰' (Hawks).
// 2. Beisebol loses '勇士' (Braves -> Warriors collision).
// 3. Futebol Americano loses '老鹰' (Eagles -> Hawks collision) 
// 4. ADD the missing NFL teams to futebol_americano so they don't leak into Outros Esportes. (Rams, Giants, Bengals, Jets, Lions, Bears, Bills, Texans, Colts, Jaguars, Titans, Chargers, Falcons, Panthers, Saints, Commanders, Cardinals, Vikings).
// 5. ADD 'rugby' Chinese terms just in case.
const newKeywords = `sportKeywords = {
  basquete: /nba|lakers|bulls|celtics|warriors|heat|knicks|nets|mavericks|suns|bucks|sixers|nuggets|curry|lebron|kobe|durant|篮球|basketball|jordan|湖人|勇士|公牛|凯尔特人|热火|尼克斯|篮网|独行侠|太阳|雄鹿|76人|掘金|老鹰|hawks|国王|kings|火箭|rockets|马刺|spurs|猛龙|raptors|灰熊|grizzlies/i,
  futebol_americano: /nfl|chiefs|eagles|patriots|ravens|49ers|packers|cowboys|steelers|dolphins|broncos|raiders|seahawks|buccaneers|rams|giants|bengals|jets|lions|bears|bills|texans|colts|jaguars|titans|chargers|falcons|panthers|saints|commanders|cardinals|vikings|browns|橄榄球|super bowl|海鹰|包装工|49人|野马|突袭者|酋长|爱国者|乌鸦|牛仔|钢人|海豚|海盗|公羊|巨人|孟加拉虎|喷气机|狮子|熊|比尔|德州人|小马|美洲虎|泰坦|闪电|猎鹰|黑豹|圣徒|指挥官|红雀|维京人|布朗/i,
  beisebol: /mlb|baseball|yankees|dodgers|red sox|braves|astros|cubs|mets|padres|phillies|rangers|棒球|扬基|道奇|红袜|太空人|小熊|大都会|教士|费城人|游骑兵/i,
  automobilismo: /\\bf1\\b|formula 1|formula one|racing|ferrari|mercedes|red\\s?bull|mclaren|aston martin|porsche|bmw motorsport|amg|petronas|nascar|motogp|yamaha|车队|赛车/i,
  rugby: /rugby|sevens|all blacks?|sydney rooster|nrl|brumbies|crusaders|hurricanes|橄榄球/i
};`;

code = code.replace(oldKeywords, newKeywords);
fs.writeFileSync('server.js', code, 'utf8');
console.log('Updated sportKeywords!');
