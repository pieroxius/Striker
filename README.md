⚡ **Striker** is a powerful and modular CLI toolkit designed for researchers, developers, and cybersecurity enthusiasts to analyze and audit blockchain address activity. It allows users to scrape the most active wallet addresses from public blockchain explorers and test private key combinations against them using high-speed brute-force scripts.

The toolkit supports major networks including **Bitcoin (BTC)**, **Ethereum (ETH)**, **Solana (SOL)**, **Dogecoin (DOGE)**, **Litecoin (LTC)**, and **Dash (DASH)**. With a queue-based system, concurrency management, and `.bat` launcher support, Striker offers flexibility for both single-chain and multi-chain operations.

> ⚠️ **Disclaimer**: Striker is intended for **educational**, **audit**, and **research** purposes only.  
> 🚫 Attempting to access or use wallets that you do not own is illegal and unethical. The authors of this tool do **not** endorse or support any malicious use, and take no responsibility for misuse of this software.

Use Striker to:
- Audit the strength of your own private keys or mnemonic phrases.
- Learn how brute-force and seed phrase security work.
- Study address activity in real time across top blockchain networks.

Make sure to comply with your local laws and only use this tool on assets you legally own or have permission to test.
---
<h3 align="center">🚀 Work Example</h3>
<p align="center">
  <img src="https://i.imgur.com/eyOcxNP.png" alt="Work Example">
</p>

##  Features

-  **Address Parsers** for:
  - BitInfoCharts: BTC, DOGE, LTC, DASH
  - Etherscan: ETH
  - SolScan: SOL
-  **Brute-force engines** for multiple blockchains
-  **Queue-based processing** with concurrency limits
-  **Clean output** to `.txt` files, one per chain
-  **Launchable via `.bat`** for Windows automation
-  **Modular codebase** for extending networks easily

##  Project Structure

The **Striker** repository is organized to ensure modularity and ease of use:

- `parsers/` — Contains individual scrapers for top wallet addresses (one per chain).
- `tablet/` — Includes brute-force scripts tailored for each blockchain.
- `run_parsers.js` — Script that executes all available parsers sequentially.
- `striker.js` — Launches all brute-force modules in parallel (up to 6 simultaneously).
- `.bat` files:
  - `1. Run parsers for create bases.bat` — Launches all parsers and generates address lists.
  - `2. Start.bat` — Starts all brute-force scripts using the generated address lists.
- `package.json` — Contains dependencies and project metadata.

This layout allows quick setup, testing, and extension to new chains with minimal adjustments.


## ⚙ Installation

> ⚠️ Requires **Node.js 22.11.0 or higher**  
> ✅ Recommended: Use Node.js version manager like [`nvm`](https://github.com/nvm-sh/nvm)

### 🛠Manual Setup

If you prefer not to use Git:

1. Download the repository as a `.zip` or copy the project files manually.
2. Open your terminal in the project folder.
3. Install dependencies: **npm install**

---

###  Option 1: Clone from GitHub

Clone the repository and install dependencies:

```bash
git clone https://github.com/pieroxius/Striker.git
cd Striker
npm install
