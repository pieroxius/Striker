const { spawn } = require('child_process');
const path = require('path');

const scripts = [
    'btc.js',
    'dash.js',
    'doge.js',
    'ltc.js',
    'eth.js',
    'sol.js'
];

let active = 0;
const maxParallel = 6; // you can increase or decrease this value

function runScript(script) {
    const scriptPath = path.join(__dirname, 'tablet', script);
    const proc = spawn('node', [scriptPath], { stdio: 'inherit' });

    active++;
    proc.on('exit', (code) => {
        active--;
        console.log(`✅ ${script} finished with exit code ${code}`);
        launchNext();
    });
}

let queue = [...scripts];

function launchNext() {
    while (queue.length > 0 && active < maxParallel) {
        const next = queue.shift();
        runScript(next);
    }
}

console.log("🚀 Launching brute-force scripts...");
launchNext();
