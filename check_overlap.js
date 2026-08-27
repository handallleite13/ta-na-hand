const regex = /nfl|chiefs|eagles|patriots|ravens|49ers|packers|cowboys|steelers|dolphins|broncos|raiders|seahawks|buccaneers|rams|giants|bengals|jets|lions|bears|bills|texans|colts|jaguars|titans|chargers|falcons|panthers|saints|commanders|cardinals|vikings|browns|橄榄球|super bowl|海鹰|包装工|49人|野马|突袭者|酋长|爱国者|乌鸦|牛仔|钢人|海豚|海盗|公羊|巨人|孟加拉虎|喷气机|狮子|熊|比尔|德州人|小马|美洲虎|泰坦|闪电|猎鹰|黑豹|圣徒|指挥官|红雀|维京人|布朗/i;
const match = "2019-2020 Edição Comemorativa S-3XL BULLS souvenir edition MEN's Rugby jerseys".match(regex);
console.log('Matches:', match ? match[0] : 'null');
