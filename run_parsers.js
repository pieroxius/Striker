const { spawn } = require('child_process');
const path = require('path');

const scripts = [
    'parser_btc.js',
    'parser_dash.js',
    'parser_doge.js',
    'parser_eth.js',
    'parser_ltc.js',
    'parser_sol.js'
];

let current = 0;

function runNext() {
    if (current >= scripts.length) {
        console.log("🎉 All parser scripts have finished.");
        return;
    }

    const script = scripts[current];
    const scriptPath = path.join(__dirname, 'parsers', script);
    console.log(`🚀 Running ${script}...`);

    const proc = spawn('node', [scriptPath], { stdio: 'inherit' });

    proc.on('exit', (code) => {
        console.log(`✅ ${script} finished with exit code ${code}\n`);
        current++;
        runNext(); // запуск следующего
    });
}

runNext();
