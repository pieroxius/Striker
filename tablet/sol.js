const fs       = require("fs");
const path     = require("path");
const crypto   = require("crypto");
const bs58     = require("bs58").default;
const { Keypair } = require("@solana/web3.js");

const ADDR_PATH   = path.resolve(__dirname, "../parsers/sol_addresses.txt");
const GOOD_FILE   = path.resolve(__dirname, "sol_good.txt");
const MAX_ATTEMPT = 1e9;
const LOG_EVERY   = 1_000;

if (!fs.existsSync(ADDR_PATH)) throw new Error("sol_addresses.txt not found");
const targets = new Set(
    fs.readFileSync(ADDR_PATH, "utf8")
        .split(/\r?\n/)
        .map(a => a.trim())
        .filter(Boolean)
);
console.log(`🎯 Loaded ${targets.size} Solana addresses for scanning\n`);

const goodOut = fs.createWriteStream(GOOD_FILE, { flags: "a" });

const randSeedHex = () => crypto.randomBytes(32).toString("hex");

function addrAndSecret(hex) {
    const seed   = Buffer.from(hex, "hex");
    const kp     = Keypair.fromSeed(seed);
    const addr   = kp.publicKey.toBase58();
    const secret = bs58.encode(kp.secretKey);
    return { addr, secret };
}

console.log("🚀 Starting scan...\n");
let found = 0;

for (let i = 0; i < MAX_ATTEMPT; i++) {
    const hex = randSeedHex();
    const { addr, secret } = addrAndSecret(hex);

    if (targets.has(addr)) {
        const line = `${addr} ${secret}`;
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
