# 🎁 Token Airdropper

**Token Airdropper** is a full-stack dApp that allows the owner to perform automated ERC20 token airdrops to multiple addresses at once.  
It includes:
- a **Solidity smart contract** for secure batch transfers,
- a **Next.js + TypeScript frontend** for interacting with the blockchain,
- **Foundry** for testing, deployment, and local development.

---

## 🚀 Features

- 🔒 Secure airdrop contract (only owner can execute)
- 🧾 Batch token distribution to many wallets
- 💡 Frontend UI built with Next.js + Ethers.js
- 🧰 Local blockchain support via Foundry Anvil
- 🧪 Easy testing and reproducible blockchain state with `dump-state` and `load-state`

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| Smart Contracts | Solidity (Foundry) |
| Frontend | Next.js + TypeScript + Ethers.js |
| Blockchain Dev | Foundry (Anvil, Forge, Cast) |
| Styling | Tailwind CSS (optional) |

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/tura11/TokenAirdropper.git
cd TokenAirdropper
