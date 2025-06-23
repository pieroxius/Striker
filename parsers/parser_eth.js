
const axios   = require("axios");
const cheerio = require("cheerio");
const fs      = require("fs");
const path    = require("path");

const OUT       = path.join(__dirname, "eth_addresses.txt");
const DELAY_MS  = 1500;
const MAX_PAGES = 100;

const ETH_RE = /^0x[a-fA-F0-9]{40}$/;

if (fs.existsSync(OUT)) fs.unlinkSync(OUT);
const stream = fs.createWriteStream(OUT, { flags: "a" });

(async () => {
    const seen = new Set();

    for (let p = 1; p <= MAX_PAGES; p++) {
        const url = `https://etherscan.io/accounts/${p}?ps=100`;

        try {
            const res = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Referer": "https://etherscan.io/",
                    "Accept-Encoding": "identity",
                    "DNT": "1"
                },
                timeout: 15000,
                validateStatus: () => true
            });

            console.log(`p${p.toString().padStart(3, "0")}: HTTP ${res.status}`);

            if (res.status !== 200 || res.data.length < 5000) {
                console.warn(`  ⚠️ suspicious response (size ${res.data.length} B)`);
                await wait(DELAY_MS);
                continue;
            }

            const $ = cheerio.load(res.data);
            let foundHere = 0;

            $('a[href^="/address/"]').each((_, el) => {
                const href = $(el).attr("href");
                const match = href.match(/^\/address\/(0x[a-fA-F0-9]{40})$/);
                if (match) {
                    const addr = match[1];
                    if (!seen.has(addr)) {
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

    stream.end(() => {
        console.log(`\n🎉 Done: ${seen.size} unique ETH addresses saved to ${OUT}`);
    });
})();

function wait(ms) {
    return new Promise((res) => setTimeout(res, ms));
}
