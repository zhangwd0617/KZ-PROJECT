const fs = require('fs');
let c = fs.readFileSync('test.txt', 'utf8');
const os = `line1
line2 \`\${name}\` world`;
c = c.replace('中文', os);
fs.writeFileSync('test.txt', c);
