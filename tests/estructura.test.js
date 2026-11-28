'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'Matematicas_Primaria.html'), 'utf8');
const core = fs.readFileSync(path.join(raiz, 'js', 'core.js'), 'utf8');

test('la página tiene un único h1', () => {
  const cuantos = (html.match(/<h1[\s>]/g) || []).length;
  assert.strictEqual(cuantos, 1);
});

test('cada módulo usa un h2 con la clase titulo-modulo', () => {
  const cuantos = (html.match(/<h2 class="titulo-modulo">/g) || []).length;
  assert.strictEqual(cuantos, 16);
});

test('comun.js se carga antes que core.js', () => {
  const iComun = html.indexOf('src="js/comun.js"');
  const iCore = html.indexOf('src="js/core.js"');
  assert.ok(iComun !== -1, 'falta js/comun.js');
  assert.ok(iCore !== -1, 'falta js/core.js');
  assert.ok(iComun < iCore, 'comun.js debe cargarse antes que core.js');
});

test('todos los scripts referenciados existen', () => {
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(scripts.length >= 18);
  for (const src of scripts) {
    assert.ok(fs.existsSync(path.join(raiz, src)), 'no existe ' + src);
  }
});

test('las zonas de resultado anuncian los cambios (aria-live)', () => {
  const cuantos = (html.match(/aria-live="polite"/g) || []).length;
  assert.ok(cuantos >= 14, 'solo hay ' + cuantos + ' zonas con aria-live');
});

test('el núcleo usa el estado v4 y migra desde v3', () => {
  assert.match(core, /mates_v4_progreso/);
  assert.match(core, /mates_v3_progreso/);
});

test('el núcleo acepta el detalle estructurado del historial', () => {
  assert.match(core, /function registrar\(mod, ok, lineas, extra\)/);
  assert.match(core, /tiempoMs/);
  assert.match(core, /copia-completa/);
});

test('existe el borrado total de datos', () => {
  assert.match(html, /id="btn-borrar-todo"/);
  assert.match(core, /function borrarTodo\(/);
});
