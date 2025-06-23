const axios  = require("axios");
const cheerio = require("cheerio");
const fs      = require("fs");
const path    = require("path");

const OUT       = path.join(__dirname, "btc_addresses.txt");
const DELAY_MS  = 1200;
const MAX_PAGES = 100;

const BTC_RE = /^(1|3|bc1)[a-z0-9]{20,90}$/i;

if (fs.existsSync(OUT)) fs.unlinkSync(OUT);
const stream = fs.createWriteStream(OUT, { flags: "a" });

(async () => {
    const seen = new Set();

    for (let p = 1; p <= MAX_PAGES; p++) {
        const url = p === 1
            ? "https://bitinfocharts.com/top-100-richest-bitcoin-addresses.html"
            : `https://bitinfocharts.com/top-100-richest-bitcoin-addresses-${p}.html`;

        try {
            const res = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Referer": "https://bitinfocharts.com/",
                    "DNT": "1",
                    "Connection": "keep-alive",
                    "Accept-Encoding": "identity"
                },
                timeout: 15000,
                validateStatus: () => true
            });

            console.log(`p${String(p).padStart(3, "0")}: HTTP ${res.status}`);

            // quick sanity-check: status and payload size
            if (res.status !== 200 || res.data.length < 5000) {
                console.warn(`  ⚠️  suspicious response (size ${res.data.length} B)`);
                await wait(DELAY_MS);
                continue;
            }

            const $ = cheerio.load(res.data);
            let foundHere = 0;

            $('a[href*="/bitcoin/address/"]').each((_, el) => {
                const href = $(el).attr("href");
                const match = href?.match(/\/bitcoin\/address\/([a-z0-9]+)/i);
                if (match) {
                    const addr = match[1];
                    if (BTC_RE.test(addr) && !seen.has(addr)) {
                        seen.add(addr);
                        stream.write(addr + "\n");
                        foundHere++;
                    }
                }
            });

            console.log(`  ✓ found ${foundHere} new (total ${seen.size})`);
        } catch (e) {
            console.error(`  ❌ error on page ${p}: ${e.message}`);
        }

        await wait(DELAY_MS);
    }

    stream.end(() =>
        console.log(`\n🎉 Done: ${seen.size} unique addresses saved to ${OUT}`)
    );
})();

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}
