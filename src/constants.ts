// constants.ts

// -------------------------------
// Contract addresses (current for local Anvil)
// -------------------------------
export const chainsToTSender: Record<number, { tsender: `0x${string}` }> = {
  // Local Anvil (chainId: 31337)
  31337: {
    tsender: "0xf5059a5D33d5853360D16C683c16e67980206f36", // ✅ New MockTSender
  },
}

export const chainsToMockToken: Record<number, { token: `0x${string}` }> = {
  31337: {
    token: "0x851356ae760d987E095750cCeb3bC6014560891C", // ✅ New MockToken
  },
}

// If you later deploy on a testnet (e.g. Sepolia),
// uncomment and add your testnet addresses:
//
// 11155111: {
//   tsender: "0xYourSepoliaTSenderAddress",
//   token: "0xYourSepoliaMockTokenAddress",
// },

// -------------------------------
// ERC20 ABI (standard ERC20 interface)
// -------------------------------
export const erc20Abi = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "transferFrom",
    stateMutability: "nonpayable",
    inputs: [
      { name: "sender", type: "address" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
]

// -------------------------------
// TSender ABI (from your MockTSender contract)
// -------------------------------
export const tsenderAbi = [
  {
    type: "function",
    name: "airdropERC20",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenAddress", type: "address" },
      { name: "recipients", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
      { name: "totalAmount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "areListsValid",
    stateMutability: "pure",
    inputs: [
      { name: "recipients", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
    ],
    outputs: [{ type: "bool" }],
  },
]
