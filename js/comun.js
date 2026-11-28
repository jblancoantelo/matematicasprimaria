/*
 * Utilidades compartidas de Aventuras Matemáticas.
 *
 * Se carga antes que core.js y antes que los módulos. Expone window.Comun y,
 * cuando se ejecuta en Node, module.exports (para poder probarla con node:test).
 *
 * Incluye el generador pseudoaleatorio con semilla: si la URL lleva
 * ?semilla=algo, Math.random pasa a ser determinista y los juegos repiten
 * exactamente la misma secuencia. Sin el parámetro todo funciona como siempre.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.Comun = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  /* ---------- Texto ---------- */

  function escaparHtml(txt) {
    return String(txt == null ? '' : txt)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 1234567 -> "1 234 567"
  function separarMiles(n) {
    return String(n == null ? '' : n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /* ---------- Azar ---------- */

  function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function elegir(lista) {
    if (!lista || !lista.length) return undefined;
    return lista[Math.floor(Math.random() * lista.length)];
  }

  // Fisher-Yates: no modifica la lista original.
  function barajar(lista) {
    var copia = lista.slice();
    for (var i = copia.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copia[i];
      copia[i] = copia[j];
      copia[j] = tmp;
    }
    return copia;
  }

  /* ---------- Semilla ---------- */

  // Mulberry32: generador pequeño, rápido y reproducible.
  function mulberry32(semilla) {
    var a = semilla >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Convierte un texto cualquiera en un entero de 32 bits estable.
  function hashSemilla(texto) {
    var h = 2166136261;
    var str = String(texto == null ? '' : texto);
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  var semillaActiva = null;

  function leerSemilla() {
    if (typeof location === 'undefined' || !location.search) return null;
    try {
      var params = new URLSearchParams(location.search);
      var valor = params.get('semilla');
      return valor == null || valor === '' ? null : valor;
    } catch (e) {
      return null;
    }
  }

  // Activa un generador determinista a partir de un texto o número.
  function activarSemilla(valor) {
    if (valor == null || valor === '') return null;
    var n = typeof valor === 'number' ? (valor >>> 0) : hashSemilla(valor);
    semillaActiva = n;
    Math.random = mulberry32(n);
    return n;
  }

  // Llamada automática al cargar: solo cambia algo si hay ?semilla=...
  function init() {
    var valor = leerSemilla();
    if (valor !== null) activarSemilla(valor);
    return semillaActiva;
  }

  function semilla() {
    return semillaActiva;
  }

  var api = {
    escaparHtml: escaparHtml,
    separarMiles: separarMiles,
    separar: separarMiles,
    randInt: randInt,
    aleatorioInt: randInt,
    elegir: elegir,
    barajar: barajar,
    mulberry32: mulberry32,
    hashSemilla: hashSemilla,
    leerSemilla: leerSemilla,
    activarSemilla: activarSemilla,
    semilla: semilla,
    init: init
  };

  init();
  return api;
});
