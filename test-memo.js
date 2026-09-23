const fs = require('fs');
const html = fs.readFileSync('memotest.html', 'utf8');
let fail = 0, total = 0;
const ok = (c, m) => { total++; console.log((c ? 'PASS  ' : 'FAIL  ') + m); if (!c) fail++; };

// --- extraigo las reglas y el generador REALES del archivo ---
const PARES    = Number(html.match(/const PARES\s+= (\d+)/)[1]);
const INTENTOS = Number(html.match(/const INTENTOS\s+= (\d+)/)[1]);
const mins     = Number(html.match(/COOLDOWN_MS = (\d+) \* 60 \* 1000/)[1]);
const FICHAS   = eval(html.match(/const FICHAS = (\[[^\]]*\]);/)[1]);
eval(html.match(/function barajar\(a\)\{[\s\S]*?\n\}/)[0]);
eval(html.match(/function armarMazo\(\)\{[\s\S]*?\n\}/)[0]);

ok(INTENTOS === 3, '3 intentos');
ok(mins === 15, 'espera de 15 minutos al perder');
ok(FICHAS.length >= PARES * 2, 'hay fichas de sobra para variar (' + FICHAS.length + ' para ' + PARES + ' pares)');

// --- el mazo: composicion correcta ---
let mazosOk = 0, sets = new Set();
for (let r = 0; r < 300; r++){
  const m = armarMazo();
  const cuenta = {};
  m.forEach(f => cuenta[f] = (cuenta[f] || 0) + 1);
  const claves = Object.keys(cuenta);
  if (m.length === PARES*2 && claves.length === PARES && claves.every(k => cuenta[k] === 2)) mazosOk++;
  sets.add(m.join(''));
}
ok(mazosOk === 300, 'en 300 rondas el tablero siempre tiene ' + PARES + ' pares exactos');
ok(sets.size > 280, 'cada ronda sale distinta (' + sets.size + ' tableros distintos en 300 rondas)');

// mismas fichas elegidas? tambien tiene que variar el SET, no solo el orden
const combos = new Set();
for (let r = 0; r < 300; r++) combos.add([...new Set(armarMazo())].sort().join(''));
ok(combos.size > 5, 'tambien cambian las fichas elegidas (' + combos.size + ' combinaciones distintas)');

// --- simulacion de partidas con la regla real ---
function jugar(memoria){          // memoria=1 juega perfecto, 0 juega al azar
  const m = armarMazo();
  const vistas = new Map();
  let hechos = 0, errores = 0;
  const libres = new Set(m.map((_, i) => i));
  while (hechos < PARES && errores < INTENTOS){
    const idx = [...libres];
    let a = idx[(Math.random()*idx.length)|0], b = null;
    if (Math.random() < memoria){
      const par = idx.find(i => i !== a && m[i] === m[a] && vistas.has(i) && vistas.has(a));
      if (par !== undefined) b = par;
    }
    if (b === null){ const otros = idx.filter(i => i !== a); b = otros[(Math.random()*otros.length)|0]; }
    vistas.set(a, m[a]); vistas.set(b, m[b]);
    if (m[a] === m[b]){ hechos++; libres.delete(a); libres.delete(b); }
    else errores++;
  }
  return { gano: hechos === PARES, hechos, errores };
}
const azar = Array.from({length: 2000}, () => jugar(0));
const memo = Array.from({length: 2000}, () => jugar(1));
const pAzar = (azar.filter(r => r.gano).length / 20).toFixed(1);
const pMemo = (memo.filter(r => r.gano).length / 20).toFixed(1);
ok(azar.every(r => r.gano ? r.hechos === PARES : r.errores === INTENTOS), 'toda partida termina por 4 pares o por 3 errores');
ok(azar.every(r => r.errores <= INTENTOS), 'nunca se pasa de 3 errores');
console.log('      -> jugando al azar gana ' + pAzar + '% | usando memoria gana ' + pMemo + '%');

// --- textos y efectos ---
ok(/Intentá de nuevo más tarde/.test(html), 'dice "Intenta de nuevo mas tarde"');
ok(/class="t">GANASTE</.test(html), 'dice GANASTE');
const term = html.match(/function terminar\(gano\)\{[\s\S]*?\n\}/)[0];
const ramas = term.split('} else {');
ok(/party\(\);/.test(ramas[0]) && !/party\(/.test(ramas[1]), 'la fiesta solo cuando gana');
ok(/nuevaRonda/.test(html) && /mazo = armarMazo\(\)/.test(html), 'cada ronda rearma el mazo');
ok(/drawImage\(p\.img/.test(html) && /const sprites = new Map\(\)/.test(html), 'efectos optimizados (sprites)');

// --- logos ---
const refs = [...html.matchAll(/logos\/([a-z-]+\.(?:png|svg))/g)].map(m => m[1]);
ok(refs.length === 6, 'los 6 logos referenciados');
ok(refs.every(f => fs.existsSync('logos/' + f)), 'los 6 archivos existen');

console.log(fail === 0 ? '\nTODO OK (' + total + '/' + total + ')' : '\n' + fail + ' de ' + total + ' fallaron');
process.exit(fail ? 1 : 0);
