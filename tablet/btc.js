const fs      = require("fs");
const path    = require("path");
const crypto  = require("crypto");
const ecc     = require("tiny-secp256k1");
const bitcoin = require("bitcoinjs-lib");
const { ECPairFactory } = require("ecpair");

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

const ADDR_PATH   = path.resolve(__dirname, "../parsers/btc_addresses.txt");
const GOOD_FILE   = path.resolve(__dirname, "btc_good.txt");
const MAX_ATTEMPT = 1e9;
const LOG_EVERY   = 1_000;

// load target addresses
if (!fs.existsSync(ADDR_PATH)) {
    throw new Error("btc_addresses.txt not found");
}
const targets = new Set(
    fs.readFileSync(ADDR_PATH, "utf8")
        .split(/\r?\n/)
        .map(a => a.trim())
        .filter(Boolean)
);
console.log(`🎯 Loaded ${targets.size} BTC addresses for scanning\n`);

const goodOut = fs.createWriteStream(GOOD_FILE, { flags: "a" });

function randPrivHex () {
    let k;
    do k = crypto.randomBytes(32); while (!ecc.isPrivate(k));
    return k.toString("hex");
}

function addrSet (hex) {
    const kp = ECPair.fromPrivateKey(Buffer.from(hex, "hex"));
    const pk = Buffer.from(kp.publicKey);
    return new Set([
        bitcoin.payments.p2pkh({ pubkey: pk }).address,
        bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({ pubkey: pk }) }).address,
        bitcoin.payments.p2wpkh({ pubkey: pk }).address,
        bitcoin.payments.p2tr({ internalPubkey: pk.slice(1, 33) }).address
    ]);
}

// ────────────────────────────────────────────
console.log("🚀 Starting scan...\n");
let found = 0;

for (let i = 0; i < MAX_ATTEMPT; i++) {
    const hex = randPrivHex();
    const hit = [...addrSet(hex)].find(a => targets.has(a));

    if (hit) {
        const wif  = ECPair.fromPrivateKey(Buffer.from(hex, "hex")).toWIF();
        const line = `${hit} ${wif}`;
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
