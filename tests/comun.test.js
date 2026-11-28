'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Comun = require('../js/comun.js');

test('escaparHtml neutraliza los caracteres peligrosos', () => {
  assert.strictEqual(
    Comun.escaparHtml('<b>"Ana" & \'Luis\'</b>'),
    '&lt;b&gt;&quot;Ana&quot; &amp; &#39;Luis&#39;&lt;/b&gt;'
  );
  assert.strictEqual(Comun.escaparHtml(null), '');
  assert.strictEqual(Comun.escaparHtml(undefined), '');
  assert.strictEqual(Comun.escaparHtml(0), '0');
});

test('separarMiles agrupa de tres en tres', () => {
  assert.strictEqual(Comun.separarMiles(1234567), '1 234 567');
  assert.strictEqual(Comun.separarMiles(999), '999');
  assert.strictEqual(Comun.separarMiles(-1234), '-1 234');
  assert.strictEqual(Comun.separar(1000), '1 000');
});

test('mulberry32 devuelve siempre la misma secuencia para la misma semilla', () => {
  const a = Comun.mulberry32(12345);
  const b = Comun.mulberry32(12345);
  for (let i = 0; i < 50; i++) {
    const x = a();
    assert.strictEqual(x, b());
    assert.ok(x >= 0 && x < 1);
  }
});

test('mulberry32 cambia de secuencia con otra semilla', () => {
  const a = Comun.mulberry32(1);
  const b = Comun.mulberry32(2);
  assert.notStrictEqual(a(), b());
});

test('hashSemilla es estable y distingue textos', () => {
  assert.strictEqual(Comun.hashSemilla('mates'), Comun.hashSemilla('mates'));
  assert.notStrictEqual(Comun.hashSemilla('mates'), Comun.hashSemilla('Mates'));
  assert.ok(Number.isInteger(Comun.hashSemilla('cualquier cosa')));
});

test('randInt respeta el rango', () => {
  for (let i = 0; i < 500; i++) {
    const n = Comun.randInt(3, 9);
    assert.ok(n >= 3 && n <= 9, 'fuera de rango: ' + n);
  }
});

test('elegir devuelve un elemento de la lista', () => {
  const lista = ['a', 'b', 'c'];
  for (let i = 0; i < 50; i++) {
    assert.ok(lista.includes(Comun.elegir(lista)));
  }
  assert.strictEqual(Comun.elegir([]), undefined);
});

test('barajar conserva los elementos y no modifica la lista original', () => {
  const original = [1, 2, 3, 4, 5];
  const copia = original.slice();
  const mezcla = Comun.barajar(original);
  assert.deepStrictEqual(original, copia);
  assert.deepStrictEqual(mezcla.slice().sort(), copia.slice().sort());
});

test('activarSemilla hace determinista Math.random y se puede restaurar', () => {
  const original = Math.random;
  try {
    Comun.activarSemilla('semilla-de-prueba');
    const primera = [Math.random(), Math.random(), Math.random()];
    Comun.activarSemilla('semilla-de-prueba');
    const segunda = [Math.random(), Math.random(), Math.random()];
    assert.deepStrictEqual(primera, segunda);
  } finally {
    Math.random = original;
  }
});

test('leerSemilla no falla fuera del navegador', () => {
  assert.strictEqual(Comun.leerSemilla(), null);
});
