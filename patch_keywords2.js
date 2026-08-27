const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Replace basquete
code = code.replace(/basquete: \/nba\|.*?\/i,/, 'basquete: /nba|lakers|bulls|celtics|warriors|heat|knicks|nets|mavericks|suns|bucks|sixers|nuggets|curry|lebron|kobe|durant|篮球|basketball|jordan|湖人|勇士|公牛|凯尔特人|热火|尼克斯|篮网|独行侠|太阳|雄鹿|76人|掘金|老鹰|hawks|国王|kings|火箭|rockets|马刺|spurs|猛龙|raptors|灰熊|grizzlies/i,');

// Replace futebol_americano
code = code.replace(/futebol_americano: \/nfl\|.*?\/i,/, 'futebol_americano: /nfl|chiefs|eagles|patriots|ravens|49ers|packers|cowboys|steelers|dolphins|broncos|raiders|seahawks|buccaneers|rams|giants|bengals|jets|lions|bears|bills|texans|colts|jaguars|titans|chargers|falcons|panthers|saints|commanders|cardinals|vikings|browns|橄榄球|super bowl|海鹰|包装工|49人|野马|突袭者|酋长|爱国者|乌鸦|牛仔|钢人|海豚|海盗|公羊|巨人|孟加拉虎|喷气机|狮子|熊|比尔|德州人|小马|美洲虎|泰坦|闪电|猎鹰|黑豹|圣徒|指挥官|红雀|维京人|布朗/i,');

// Replace beisebol
code = code.replace(/beisebol: \/mlb\|.*?\/i,/, 'beisebol: /mlb|baseball|yankees|dodgers|red sox|braves|astros|cubs|mets|padres|phillies|rangers|棒球|扬基|道奇|红袜|太空人|小熊|大都会|教士|费城人|游骑兵/i,');

// Replace rugby
code = code.replace(/rugby: \/rugby\|.*?\/i\n/, 'rugby: /rugby|sevens|all blacks?|sydney rooster|nrl|brumbies|crusaders|hurricanes|橄榄球/i\n');

fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed sportKeywords regexes!');
