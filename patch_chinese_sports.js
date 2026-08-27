const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const newBasquete = `/nba|lakers|bulls|celtics|warriors|heat|knicks|nets|mavericks|suns|bucks|sixers|nuggets|curry|lebron|kobe|durant|篮球|basketball|jordan|湖人|勇士|公牛|凯尔特人|热火|尼克斯|篮网|独行侠|太阳|雄鹿|76人|掘金/i`;

const newFutebolAmericano = `/nfl|chiefs|eagles|patriots|ravens|49ers|packers|cowboys|steelers|dolphins|broncos|raiders|seahawks|buccaneers|橄榄球|super bowl|海鹰|包装工|49人|野马|突袭者|酋长|老鹰|爱国者|乌鸦|牛仔|钢人|海豚|海盗/i`;

const newBeisebol = `/mlb|baseball|yankees|dodgers|red sox|braves|astros|cubs|mets|padres|phillies|rangers|棒球|扬基|道奇|红袜|勇士|太空人|小熊|大都会|教士|费城人|游骑兵/i`;

code = code.replace(/basquete: \/nba.*?\/i/, `basquete: ${newBasquete}`);
code = code.replace(/futebol_americano: \/nfl.*?\/i/, `futebol_americano: ${newFutebolAmericano}`);
code = code.replace(/beisebol: \/mlb.*?\/i/, `beisebol: ${newBeisebol}`);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed Chinese sport keywords!');
