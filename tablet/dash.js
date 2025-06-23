const fs      = require("fs");
const path    = require("path");
const crypto  = require("crypto");
const ecc     = require("tiny-secp256k1");
const bitcoin = require("bitcoinjs-lib");
const { ECPairFactory } = require("ecpair");

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

const ADDR_PATH   = path.resolve(__dirname, "../parsers/dash_addresses.txt");
const GOOD_FILE   = path.resolve(__dirname, "dash_good.txt");
const MAX_ATTEMPT = 1e9;
const LOG_EVERY   = 1_000;

if (!fs.existsSync(ADDR_PATH)) throw new Error("dash_addresses.txt not found");
const targets = new Set(
    fs.readFileSync(ADDR_PATH, "utf8")
        .split(/\r?\n/)
        .map(a => a.trim())
        .filter(Boolean)
);
console.log(`🎯 Loaded ${targets.size} DASH addresses for scanning\n`);

const NETWORK = {
    messagePrefix: "\x19DarkCoin Signed Message:\n",
    bech32: "",
    bip32: { public: 0x0488b21e, private: 0x0488ade4 },
    pubKeyHash: 0x4c,
    scriptHash: 0x10,
    wif: 0xcc
};

const goodOut = fs.createWriteStream(GOOD_FILE, { flags: "a" });

function randPrivHex() {
    let k;
    do k = crypto.randomBytes(32); while (!ecc.isPrivate(k));
    return k.toString("hex");
}

function addrSet(hex) {
    const kp = ECPair.fromPrivateKey(Buffer.from(hex, "hex"), { network: NETWORK });
    const pk = Buffer.from(kp.publicKey);
    return new Set([
        bitcoin.payments.p2pkh({ pubkey: pk, network: NETWORK }).address
    ]);
}

console.log("🚀 Starting scan...\n");
let found = 0;

for (let i = 0; i < MAX_ATTEMPT; i++) {
    const hex = randPrivHex();
    const hit = [...addrSet(hex)].find(a => targets.has(a));
    if (hit) {
        const wif  = ECPair.fromPrivateKey(Buffer.from(hex, "hex"), { network: NETWORK }).toWIF();
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
