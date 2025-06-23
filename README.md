# Striker

⚡ **Striker** is a powerful CLI toolkit for scraping top crypto wallet addresses and performing high-speed private key brute-force checks across multiple blockchains (BTC, ETH, SOL, DOGE, LTC, DASH).

---

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
