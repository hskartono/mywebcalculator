'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { tambah, kurang, kali, bagi } = require('../src/calculator');

test('tambah: adds positive numbers', () => {
  assert.equal(tambah(2, 3), 5);
});

test('tambah: adds negative numbers', () => {
  assert.equal(tambah(-2, -3), -5);
});

test('tambah: adds decimals', () => {
  assert.equal(tambah(0.1, 0.2), 0.30000000000000004);
});

test('tambah: throws TypeError on non-numeric input', () => {
  assert.throws(() => tambah('2', 3), TypeError);
  assert.throws(() => tambah(2, NaN), TypeError);
});

test('kurang: subtracts positive numbers', () => {
  assert.equal(kurang(5, 3), 2);
});

test('kurang: subtracts negative numbers', () => {
  assert.equal(kurang(-5, -3), -2);
});

test('kurang: subtracts decimals', () => {
  assert.equal(kurang(1.5, 0.5), 1);
});

test('kurang: throws TypeError on non-numeric input', () => {
  assert.throws(() => kurang('5', 3), TypeError);
  assert.throws(() => kurang(5, Infinity), TypeError);
});

test('kali: multiplies positive numbers', () => {
  assert.equal(kali(4, 3), 12);
});

test('kali: multiplies negative numbers', () => {
  assert.equal(kali(-4, 3), -12);
});

test('kali: multiplies decimals', () => {
  assert.equal(kali(1.5, 2), 3);
});

test('kali: multiplying by zero returns zero', () => {
  assert.equal(kali(5, 0), 0);
});

test('kali: throws TypeError on non-numeric input', () => {
  assert.throws(() => kali('4', 3), TypeError);
});

test('bagi: divides positive numbers', () => {
  assert.equal(bagi(10, 2), 5);
});

test('bagi: divides negative numbers', () => {
  assert.equal(bagi(-10, 2), -5);
});

test('bagi: divides decimals', () => {
  assert.equal(bagi(1, 4), 0.25);
});

test('bagi: throws on division by zero', () => {
  assert.throws(() => bagi(10, 0), /Division by zero/);
});

test('bagi: throws TypeError on non-numeric input', () => {
  assert.throws(() => bagi('10', 2), TypeError);
  assert.throws(() => bagi(10, '2'), TypeError);
});
