const fs         = require("fs");
const puppeteer  = require("puppeteer");
const path       = require("path");

const OUT_FILE   = path.join(__dirname, "sol_addresses.txt");
const MAX_PAGES  = 100;
const PAGE_SIZE  = 100;

if (fs.existsSync(OUT_FILE)) fs.unlinkSync(OUT_FILE);
const out = fs.createWriteStream(OUT_FILE, { flags: "a" });
const SOL_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page    = await browser.newPage();
    const seen    = new Set();

    for (let p = 1; p <= MAX_PAGES; p++) {
        const url =
            p === 1
                ? "https://solscan.io/leaderboard/account"
                : `https://solscan.io/leaderboard/account?page=${p}`;

        console.log(`▶ page ${p}/${MAX_PAGES}`);
        await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
        await page.waitForSelector('a[href^="/account/"]', { timeout: 20_000 });
        const addrs = await page.$$eval('a[href^="/account/"]', links =>
            links
                .map(a => {
                    const m = a.getAttribute("href").match(/^\/account\/([A-Za-z0-9]{32,44})$/);
                    return m ? m[1] : null;
                })
                .filter(Boolean)
        );

        let foundHere = 0;
        for (const addr of addrs) {
            if (SOL_RE.test(addr) && !seen.has(addr)) {
                seen.add(addr);
                out.write(addr + "\n");
                foundHere++;
            }
        }
        console.log(`   ✓ ${foundHere} new (total ${seen.size})`);

        if (addrs.length === 0) break;
    }

    await browser.close();
    out.end(() =>
        console.log(`\n🎉 Done: ${seen.size} unique addresses saved to ${OUT_FILE}`)
    );
})();
