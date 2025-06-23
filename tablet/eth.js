const fs   = require("fs");
const path = require("path");
const crypto = require("crypto");
const { privateToAddress, toChecksumAddress } = require("ethereumjs-util");

const ADDR_PATH   = path.resolve(__dirname, "../parsers/eth_addresses.txt");
const GOOD_FILE   = path.resolve(__dirname, "eth_good.txt");
const MAX_ATTEMPT = 1e9;
const LOG_EVERY   = 1_000;

if (!fs.existsSync(ADDR_PATH)) throw new Error("eth_addresses.txt not found");
const targets = new Set(
    fs.readFileSync(ADDR_PATH, "utf8")
        .split(/\r?\n/)
        .map(a => a.trim().toLowerCase())
        .filter(Boolean)
);
console.log(`🎯 Loaded ${targets.size} ETH addresses for scanning\n`);

const goodOut = fs.createWriteStream(GOOD_FILE, { flags: "a" });

function randPrivHex () {
    let k;
    do k = crypto.randomBytes(32); while (k[0] === 0);
    return k.toString("hex");
}

function addrFromPriv (hex) {
    const priv = Buffer.from(hex, "hex");
    return toChecksumAddress("0x" + privateToAddress(priv).toString("hex"));
}

console.log("🚀 Starting scan...\n");
let found = 0;

for (let i = 0; i < MAX_ATTEMPT; i++) {
    const hex  = randPrivHex();
    const addr = addrFromPriv(hex);

    if (targets.has(addr.toLowerCase())) {
        const line = `${addr} ${hex}`;
        goodOut.write(line + "\n");
        console.log(`🎯 MATCH FOUND → ${line}`);
        found++;
    }

    if ((i + 1) % LOG_EVERY === 0) {
        console.log(`🔄 Scanned: ${i + 1} | Matches: ${found}`);
    }
}

goodOut.end();
console.log(`\n🏁 Completed. Total matches: ${found}`);
