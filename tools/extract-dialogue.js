/**
 * ERB Dialogue Extractor
 * Reads EVENT_K*.ERB files and emits structured JS modules.
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = "E:\\SSTM\\eraa\\era\\eraMaouEx-master\\ERB";
const OUT_DIR = "D:\\KZ PROJECT\\js\\dialogues";

// Map filename suffix to dialogue ID
function extractIdFromFilename(name) {
    // EVENT_K0_慈愛.ERB -> 0
    // EVENT_K10_クラブ.ERB -> 10
    // EVENT_K903_嘉德.ERB -> 903
    const m = name.match(/EVENT_K(\d+)/);
    return m ? parseInt(m[1]) : null;
}

function extractNameFromFilename(name) {
    const m = name.match(/EVENT_K\d+_(.+?)\.ERB/);
    return m ? m[1] : "";
}

function cleanText(raw) {
    let s = raw.trim();
    // Remove surrounding full-width quotes
    if (s.startsWith('「') && s.endsWith('」')) {
        s = s.slice(1, -1);
    }
    // Replace ERB control codes
    s = s.replace(/%SAVESTR:TARGET%/g, '${target.name}');
    s = s.replace(/%SAVESTR:PLAYER%/g, '${master.name}');
    s = s.replace(/%SELF_CALL\(TARGET\)%/g, '我');
    s = s.replace(/%SELF_CALL_FIRST\(TARGET\)%/g, '我');
    s = s.replace(/%UNICODE\(0x2661\)(?:\s*\*?\s*\d*)?%/g, '♡');
    s = s.replace(/%UNICODE\(0x2665\)(?:\s*\*?\s*\d*)?%/g, '♥');
    s = s.replace(/%UNICODE\(0x266A\)(?:\s*\*?\s*\d*)?%/g, '♪');
    s = s.replace(/%UNICODE\(0x2605\)(?:\s*\*?\s*\d*)?%/g, '★');
    // Remove remaining %...% codes (unknown variables)
    s = s.replace(/%[A-Z_0-9:]+\([^)]*\)%/g, '');
    s = s.replace(/%[A-Z_0-9:]+%/g, '');
    // Collapse multiple spaces
    s = s.replace(/\s+/g, ' ').trim();
    return s;
}

function inferState(conditionLine) {
    const cl = conditionLine.toUpperCase().replace(/\s+/g, ' ');

    // SELECTCOM
    const sc = cl.match(/SELECTCOM\s*==\s*(\d+)/);
    if (sc) return { type: 'comId', value: parseInt(sc[1]) };

    // CFLAG first-time
    const cf = cl.match(/CFLAG:\s*(\d+)\s*==\s*0/);
    if (cf) {
        const cid = parseInt(cf[1]);
        if (cid >= 301 && cid <= 500) return { type: 'state', value: 'first' };
    }

    // TALENT 76 = lewd
    if (/TALENT:.*76\s*==?\s*1/.test(cl)) return { type: 'state', value: 'lewd' };
    // TALENT 85 = love
    if (/TALENT:.*85\s*==?\s*1/.test(cl)) return { type: 'state', value: 'love' };
    // TALENT 9 = broken
    if (/TALENT:.*9\s*==?\s*1/.test(cl)) return { type: 'state', value: 'broken' };

    // MARK:2 = 3 -> yield3
    if (/MARK:\s*2\s*==?\s*3/.test(cl)) return { type: 'state', value: 'yield3' };
    // MARK:2 = 2 -> yield2
    if (/MARK:\s*2\s*==?\s*2/.test(cl)) return { type: 'state', value: 'yield2' };
    // MARK:2 <= 1 or == 1 -> yield1
    if (/MARK:\s*2\s*(<=?|==)\s*1/.test(cl)) return { type: 'state', value: 'yield1' };

    // PALAM / parameter events
    const palamLust = cl.match(/PALAM:\s*(\d+)/);
    if (palamLust && /PALAM.*LV2/.test(cl)) {
        const pId = parseInt(palamLust[1]);
        const map = { 3: 'lubrication_lv2', 5: 'lust_lv2', 8: 'shame_lv2', 10: 'fear_lv2' };
        if (map[pId]) return { type: 'palam', value: map[pId] };
    }

    // Climax (juels / source related)
    if (/EX:\s*2\s*>=?\s*1/.test(cl) || /NOWEX:\s*\d+/.test(cl)) {
        return { type: 'palam', value: 'climax' };
    }

    // Mark change events
    const mk = cl.match(/MARK:\s*(\d+)\s*==?\s*(\d+)/);
    if (mk) {
        const mId = parseInt(mk[1]);
        const mLv = parseInt(mk[2]);
        const map = { 0: 'pain', 1: 'pleasure', 2: 'yield', 3: 'rebel', 4: 'timid', 5: 'brand' };
        if (map[mId]) return { type: 'mark', value: `${map[mId]}_lv${mLv}` };
    }

    return null;
}

function parseErb(lines, kid) {
    const result = {
        id: kid,
        trainStart: { first: [], lewd: [], love: [], yield3: [], yield2: [], yield1: [], rebel: [], broken: [], default: [] },
        commands: {},
        palamCng: {},
        markCng: {}
    };

    let mode = null; // 'com', 'palam', 'mark', 'train', 'self'
    let stack = [];
    let currentComId = null;
    let currentState = null;
    let buffer = [];

    function flushBuffer() {
        if (buffer.length === 0) return;
        const cleaned = buffer.map(cleanText).filter(t => t.length > 0);
        if (cleaned.length === 0) { buffer = []; return; }

        if (mode === 'train' && currentState) {
            const bucket = result.trainStart[currentState] || result.trainStart.default;
            bucket.push(cleaned);
        } else if (mode === 'com' && currentComId !== null && currentState) {
            if (!result.commands[currentComId]) result.commands[currentComId] = {};
            const comData = result.commands[currentComId];
            if (!comData[currentState]) comData[currentState] = [];
            comData[currentState].push(cleaned);
        } else if (mode === 'palam' && currentState) {
            if (!result.palamCng[currentState]) result.palamCng[currentState] = [];
            result.palamCng[currentState].push(cleaned);
        } else if (mode === 'mark' && currentState) {
            if (!result.markCng[currentState]) result.markCng[currentState] = [];
            result.markCng[currentState].push(cleaned);
        }
        buffer = [];
    }

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line === '' || line.startsWith(';')) continue;

        // Detect section headers
        if (line.startsWith('@')) {
            flushBuffer();
            stack = [];
            currentComId = null;
            currentState = null;

            if (/^@KOJO_MESSAGE_COM_\d+/.test(line)) {
                mode = 'com';
            } else if (/^@KOJO_MESSAGE_PALAMCNG_\d+/.test(line)) {
                mode = 'palam';
            } else if (/^@KOJO_MESSAGE_MARKCNG_\d+/.test(line)) {
                mode = 'mark';
            } else if (/^@EVENTTRAIN\b/.test(line)) {
                mode = 'train';
            } else if (/^@SELF_KOJO_K\d+/.test(line)) {
                mode = 'train'; // treat self kojo as train-start extension
            } else {
                mode = null;
            }
            continue;
        }

        if (!mode) continue;

        // Skip single-line returns / simple control flow
        if (/^SIF\s+/.test(line) && /RETURN\s+0/.test(line)) continue;
        if (/^RETURN\s+0/.test(line)) { flushBuffer(); continue; }
        if (/^RETURN\s+1/.test(line)) { flushBuffer(); continue; }
        if (/^DRAWLINE/.test(line)) continue;
        if (/^CFLAG:\s*\d+\s*=/.test(line)) continue;
        if (/^LOCAL\s*=/.test(line)) continue;
        if (/^FLAG:\s*\d+\s*=/.test(line)) continue;
        if (/^CALL\s+/.test(line)) continue;
        if (/^LOCAL:\s*\d+\s*=/.test(line)) continue;

        // IF / ELSEIF / ELSE / ENDIF
        const ifMatch = line.match(/^IF\s+(.+)/);
        if (ifMatch) {
            flushBuffer();
            const cond = inferState(ifMatch[1]);
            stack.push({ keyword: 'IF', condition: cond, raw: ifMatch[1] });
            if (cond && cond.type === 'comId') currentComId = cond.value;
            if (cond && cond.type === 'state') currentState = cond.value;
            if (cond && cond.type === 'palam') currentState = cond.value;
            if (cond && cond.type === 'mark') currentState = cond.value;
            continue;
        }

        const elseIfMatch = line.match(/^ELSEIF\s+(.+)/);
        if (elseIfMatch) {
            flushBuffer();
            const cond = inferState(elseIfMatch[1]);
            if (stack.length > 0) {
                stack[stack.length - 1].condition = cond;
                stack[stack.length - 1].raw = elseIfMatch[1];
            }
            if (cond && cond.type === 'comId') currentComId = cond.value;
            if (cond && cond.type === 'state') currentState = cond.value;
            if (cond && cond.type === 'palam') currentState = cond.value;
            if (cond && cond.type === 'mark') currentState = cond.value;
            continue;
        }

        if (/^ELSE\b/.test(line)) {
            flushBuffer();
            if (stack.length > 0) {
                // If we're inside a CFLAG repeat branch and no explicit state set,
                // treat ELSE as default
                if (currentState && currentState !== 'first') {
                    stack[stack.length - 1].condition = { type: 'state', value: 'default' };
                    currentState = 'default';
                } else if (!currentState) {
                    stack[stack.length - 1].condition = { type: 'state', value: 'default' };
                    currentState = 'default';
                }
            }
            continue;
        }

        if (/^ENDIF\b/.test(line)) {
            flushBuffer();
            if (stack.length > 0) {
                const popped = stack.pop();
                // Restore comId / state from remaining stack
                currentComId = null;
                currentState = null;
                for (let j = stack.length - 1; j >= 0; j--) {
                    const c = stack[j].condition;
                    if (c) {
                        if (c.type === 'comId' && currentComId === null) currentComId = c.value;
                        if ((c.type === 'state' || c.type === 'palam' || c.type === 'mark') && currentState === null) currentState = c.value;
                    }
                }
            }
            continue;
        }

        // PRINTFORMW / PRINTFORML / PRINTFORM
        const printMatch = line.match(/^(PRINTFORMW|PRINTFORML|PRINTFORM)\s+(.+)/);
        if (printMatch) {
            const text = printMatch[2];
            // Skip system-only lines (no actual character speech)
            // Keep lines that have Chinese characters or are clearly dialogue
            const hasChinese = /[\u4e00-\u9fff]/.test(text);
            const hasQuotes = /[「"]/.test(text);
            if (hasChinese || hasQuotes) {
                buffer.push(text);
            }
            continue;
        }
    }

    flushBuffer();
    return result;
}

function formatJsModule(data, name, type) {
    const json = JSON.stringify(data, null, 4)
        .replace(/"\$\{target\.name\}"/g, '"${target.name}"')
        .replace(/"\$\{master\.name\}"/g, '"${master.name}"');

    return `// Auto-extracted from EVENT_K${data.id}_${name}.ERB
// Type: ${type}
window.DIALOGUE_K${data.id} = ${json};
`;
}

function processFile(filename) {
    const kid = extractIdFromFilename(filename);
    if (kid === null) return;

    const name = extractNameFromFilename(filename);
    const type = kid >= 900 ? 'exclusive' : 'personality';
    const srcPath = path.join(SOURCE_DIR, filename);
    const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/);

    console.log(`Processing ${filename} (K${kid}) ...`);
    const data = parseErb(lines, kid);
    data.name = name;
    data.type = type;

    const outSubdir = type === 'exclusive' ? 'exclusive' : 'personality';
    const outPath = path.join(OUT_DIR, outSubdir, `K${kid}.js`);
    fs.writeFileSync(outPath, formatJsModule(data, name, type), 'utf8');

    // Stats
    const comCount = Object.keys(data.commands).length;
    let lineCount = 0;
    for (const comId in data.commands) {
        for (const state in data.commands[comId]) {
            lineCount += data.commands[comId][state].length;
        }
    }
    console.log(`  -> commands: ${comCount}, dialogue blocks: ${lineCount}, trainStart: ${Object.values(data.trainStart).flat().length}, palam: ${Object.values(data.palamCng).flat().length}, mark: ${Object.values(data.markCng).flat().length}`);
}

// Main
const files = fs.readdirSync(SOURCE_DIR)
    .filter(f => f.startsWith('EVENT_K') && f.endsWith('.ERB'))
    .sort();

for (const f of files) {
    processFile(f);
}

console.log('\nExtraction complete.');
