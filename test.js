const fs = require('fs');
const html = fs.readFileSync('trivia.html', 'utf8');
let fail = 0, total = 0;
const ok = (c, m) => { total++; console.log((c ? 'PASS  ' : 'FAIL  ') + m); if (!c) fail++; };

// ---------- contenido ----------
const raw = html.match(/const QUESTIONS = (\[[\s\S]*?\n\];)/)[1];
const Q = eval(raw.replace(/;$/, ''));
ok(Q.length === 10, '10 preguntas');
ok(Q.every(q => q.o.length === 4), 'todas con 4 opciones');
ok(Q.every(q => q.c >= 0 && q.c < 4), 'indice correcto valido');
ok(!/verdadero|falso/i.test(raw), 'sin verdadero/falso');
ok(!/basura|residuo|desperdicio|descartar/i.test(html), 'sin menciones a basura/residuos');

// ---------- reglas ----------
const PASS = Number(html.match(/const PASS\s*=\s*(\d+)/)[1]);
const mins = Number(html.match(/COOLDOWN_MS = (\d+) \* 60 \* 1000/)[1]);
ok(PASS === 6, 'gana con 6+');
ok(mins === 15, 'cooldown 15 min');
let bien = 0;
for (let s = 0; s <= 10; s++) if ((s >= PASS) === (s >= 6)) bien++;
ok(bien === 11, 'los 11 puntajes resuelven bien');

// ---------- textos ----------
ok(/class="t">GANASTE</.test(html), 'dice GANASTE');
ok(/Volvé a intentar en 15 minutos/.test(html), 'cartel de espera correcto');
ok(/Acertaste <b>/.test(html), 'dice "Acertaste x/10"');
ok(!/classList\.add\("bad"\)/.test(html), 'no marca errores durante el juego');

// ---------- efectos ----------
ok(/<canvas id="fx">/.test(html), 'canvas presente');
ok(/function party\(\)/.test(html) && /function burst\(/.test(html), 'motor de efectos definido');
ok(/const EMOTES =/.test(html) && /const BOOKS  =/.test(html), 'sets de emotes y libritos');
ok(/dropEmoji\(EMOTES/.test(html) && /dropEmoji\(BOOKS/.test(html), 'lluvia de emotes y libritos');
ok(/riseEmoji\(BOOKS/.test(html), 'libritos que suben');

const finishFn = html.match(/function finish\(\)\{[\s\S]*?\n\}/)[0];
const ramas = finishFn.split('} else {');
ok(/party\(\);/.test(ramas[0]), 'party() esta en la rama de ganar');
ok(ramas.length === 2 && !/party\(/.test(ramas[1]), 'la rama de perder no dispara efectos');

// ---------- performance ----------
const loopFn = html.slice(html.indexOf('function loop('), html.indexOf('function every('));
ok(/const sprites = new Map\(\)/.test(html), 'cache de sprites definido');
ok(/drawImage\(p\.img/.test(loopFn), 'los emojis se copian como sprite');
ok(!/fillText/.test(loopFn), 'el loop NO usa fillText (era lo que trababa)');
ok(/Math\.min\(window\.devicePixelRatio \|\| 1, 1\.5\)/.test(html), 'devicePixelRatio capado a 1.5');
ok(/let MAX\s+= \d+/.test(html) && /MAX = Math\.max\(140/.test(html), 'tope de particulas con auto-ajuste');

// ---------- limpieza / dependencias ----------
const newGameFn = html.match(/function newGame\(\)\{[\s\S]*?render\(\);/)[0];
ok(/stopFX\(\)/.test(newGameFn), 'newGame limpia los efectos');
ok(/timers\.forEach\(clearInterval\)/.test(html), 'stopFX cancela todos los timers');
ok(/prefers-reduced-motion/.test(html), 'respeta prefers-reduced-motion');
ok(!/cdn|unpkg|jsdelivr/i.test(html.replace(/fonts\.(googleapis|gstatic)\.com/g, '')), 'sin CDN: anda sin internet');

// ---------- logos ----------
const refs = [...html.matchAll(/logos\/([a-z-]+\.(?:png|svg))/g)].map(m => m[1]);
ok(refs.length === 6, 'los 6 logos referenciados');
const faltan = refs.filter(f => !fs.existsSync('logos/' + f));
ok(faltan.length === 0, 'todos los archivos de logo existen' + (faltan.length ? ' (faltan: ' + faltan + ')' : ''));

console.log(fail === 0 ? '\nTODO OK (' + total + '/' + total + ')' : '\n' + fail + ' de ' + total + ' fallaron');
process.exit(fail ? 1 : 0);
