/**
 * Emuera Core Runtime Simulation
 * Provides global functions and variables commonly used in original ERB
 */

// ========== Random numbers ==========
function RAND(n) {
    return Math.floor(Math.random() * n);
}

function RAND_RANGE(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function SQRAND(n) {
    // 平方随机（低值概率更高）
    return Math.floor(Math.random() * Math.random() * n);
}

// ========== Array operations ==========
function MAX(array) {
    return Math.max(...array);
}

function MIN(array) {
    return Math.min(...array);
}

function SUM(array) {
    return array.reduce((a, b) => a + b, 0);
}

function MATCH(array, value, start = 0) {
    for (let i = start; i < array.length; i++) {
        if (array[i] === value) return i;
    }
    return -1;
}

function FINDELEMENT(array, value, start = 0) {
    return MATCH(array, value, start);
}

// ========== String tools ==========
function TOSTR(n) {
    return String(n);
}

function TOINT(s) {
    return parseInt(s) || 0;
}

function REPLACE(text, oldStr, newStr) {
    return text.split(oldStr).join(newStr);
}

function SUBSTRING(text, start, length) {
    return text.substr(start, length);
}

// ========== Conditional expressions ==========
function LIMIT(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function SIGN(value) {
    return value > 0 ? 1 : (value < 0 ? -1 : 0);
}

function ABS(value) {
    return Math.abs(value);
}

function POWER(base, exp) {
    return Math.pow(base, exp);
}

function SQRT(value) {
    return Math.sqrt(value);
}

// ========== Line count / pagination ==========
function LINECOUNT() {
    return document.getElementById('game-text').childElementCount;
}

function CLEARLINE(n) {
    const box = document.getElementById('game-text');
    for (let i = 0; i < n && box.lastChild; i++) {
        box.removeChild(box.lastChild);
    }
}

// ========== Time / date ==========
function GETTIME() {
    return Date.now();
}

// ========== Exports ==========
window.RAND = RAND;
window.RAND_RANGE = RAND_RANGE;
window.SQRAND = SQRAND;
window.LIMIT = LIMIT;
window.SIGN = SIGN;
window.ABS = ABS;
window.POWER = POWER;
window.SQRT = SQRT;
