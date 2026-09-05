'use strict';

function assertNumber(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Expected a finite number, got: ${value}`);
  }
}

function tambah(a, b) {
  assertNumber(a);
  assertNumber(b);
  return a + b;
}

function kurang(a, b) {
  assertNumber(a);
  assertNumber(b);
  return a - b;
}

function kali(a, b) {
  assertNumber(a);
  assertNumber(b);
  return a * b;
}

function bagi(a, b) {
  assertNumber(a);
  assertNumber(b);
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

module.exports = { tambah, kurang, kali, bagi };
