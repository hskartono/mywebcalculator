'use strict';

// Mirrors the semantics of src/calculator.js (tambah/kurang/kali/bagi),
// reimplemented here since this is a plain browser page with no bundler
// to import the Node/CommonJS module.
function tambah(a, b) {
  return a + b;
}

function kurang(a, b) {
  return a - b;
}

function kali(a, b) {
  return a * b;
}

function bagi(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

const OPERATIONS = {
  '+': tambah,
  '-': kurang,
  '*': kali,
  '/': bagi,
};

const display = document.getElementById('display');

const state = {
  currentInput: '0',
  previousValue: null,
  operator: null,
  overwrite: true,
  // Remember the last operator/operand so repeated "=" presses repeat the
  // last operation, e.g. "5 + 3 = = =" -> 8, 11, 14.
  lastOperator: null,
  lastOperand: null,
};

// Avoids ugly floating point artifacts (e.g. 0.1 + 0.2 -> 0.30000000000000004,
// or 0.3 - 0.1 - 0.2 -> -2.7755575615628914e-17). Only called with finite
// values; compute() routes NaN/Infinity results to the Error state instead.
function formatNumber(value) {
  let rounded = parseFloat(value.toPrecision(12));
  if (Math.abs(rounded) < 1e-10) {
    rounded = 0;
  }
  return String(rounded);
}

function updateDisplay() {
  display.textContent = state.currentInput;
}

function resetState() {
  state.currentInput = '0';
  state.previousValue = null;
  state.operator = null;
  state.overwrite = true;
  state.lastOperator = null;
  state.lastOperand = null;
}

function setError() {
  state.currentInput = 'Error';
  state.previousValue = null;
  state.operator = null;
  state.overwrite = true;
  state.lastOperator = null;
  state.lastOperand = null;
}

function inputDigit(digit) {
  if (state.overwrite) {
    state.currentInput = digit;
    state.overwrite = false;
  } else if (state.currentInput === '0') {
    state.currentInput = digit;
  } else {
    state.currentInput += digit;
  }
}

function inputDecimal() {
  if (state.overwrite) {
    state.currentInput = '0.';
    state.overwrite = false;
    return;
  }
  if (!state.currentInput.includes('.')) {
    state.currentInput += '.';
  }
}

// Combines a and b with the given operator, updating currentInput/previousValue
// on success, or moving to the Error state on failure (e.g. divide by zero).
function compute(a, b, operator) {
  try {
    const result = OPERATIONS[operator](a, b);
    if (!Number.isFinite(result)) {
      // e.g. overflow to Infinity, or an indeterminate NaN result.
      setError();
      return false;
    }
    state.previousValue = result;
    state.currentInput = formatNumber(result);
    return true;
  } catch (err) {
    setError();
    return false;
  }
}

function applyPendingOperation() {
  if (state.operator === null || state.previousValue === null) {
    return true;
  }
  const current = parseFloat(state.currentInput);
  return compute(state.previousValue, current, state.operator);
}

function chooseOperator(op) {
  if (state.currentInput === 'Error') {
    return;
  }
  if (state.operator !== null && !state.overwrite) {
    if (!applyPendingOperation()) {
      return;
    }
  } else if (state.operator === null) {
    state.previousValue = parseFloat(state.currentInput);
  }
  state.operator = op;
  state.overwrite = true;
  state.lastOperator = null;
  state.lastOperand = null;
}

function equals() {
  if (state.currentInput === 'Error') {
    return;
  }
  if (state.operator !== null) {
    if (state.overwrite) {
      return;
    }
    const operand = parseFloat(state.currentInput);
    if (!applyPendingOperation()) {
      return;
    }
    state.lastOperator = state.operator;
    state.lastOperand = operand;
    state.operator = null;
    state.overwrite = true;
    return;
  }
  // Repeat the last operation when "=" is pressed again with nothing new typed.
  if (state.overwrite && state.lastOperator !== null) {
    const base = parseFloat(state.currentInput);
    if (compute(base, state.lastOperand, state.lastOperator)) {
      state.overwrite = true;
    }
  }
}

function performAction(action, value) {
  switch (action) {
    case 'digit':
      inputDigit(value);
      break;
    case 'decimal':
      inputDecimal();
      break;
    case 'operator':
      chooseOperator(value);
      break;
    case 'equals':
      equals();
      break;
    case 'clear':
      resetState();
      break;
    default:
      return;
  }
  updateDisplay();
}

document.querySelectorAll('.btn').forEach((button) => {
  button.addEventListener('click', () => {
    performAction(button.dataset.action, button.dataset.value);
  });
});

const KEY_ACTIONS = {
  '0': ['digit', '0'],
  '1': ['digit', '1'],
  '2': ['digit', '2'],
  '3': ['digit', '3'],
  '4': ['digit', '4'],
  '5': ['digit', '5'],
  '6': ['digit', '6'],
  '7': ['digit', '7'],
  '8': ['digit', '8'],
  '9': ['digit', '9'],
  '.': ['decimal'],
  '+': ['operator', '+'],
  '-': ['operator', '-'],
  '*': ['operator', '*'],
  '/': ['operator', '/'],
  Enter: ['equals'],
  '=': ['equals'],
  Escape: ['clear'],
};

document.addEventListener('keydown', (event) => {
  // Let modifier combos through untouched (e.g. Ctrl/Cmd + Plus/Minus for
  // browser zoom, Ctrl + digit for tab switching).
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }
  // If a calculator button already has keyboard focus, let its native
  // Enter/Space activation handle it instead of double-firing here.
  if (event.target instanceof Element && event.target.closest('.btn')) {
    return;
  }
  const mapped = KEY_ACTIONS[event.key];
  if (!mapped) {
    return;
  }
  event.preventDefault();
  performAction(mapped[0], mapped[1]);
});

updateDisplay();
