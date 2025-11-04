// constants.ts
export const chainsToTSender: Record<number, { tsender: `0x${string}` }> = {
    // Lokalny Anvil / Hardhat
    31337: {
      tsender: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    },
    // Jeśli później chcesz dodać testnet (np. Sepolia)
    // 11155111: { tsender: "0xYourSepoliaTSenderAddress" },
  }
  
  // Opcjonalne: tylko do testów lokalnych
  export const chainsToMockToken: Record<number, { token: `0x${string}` }> = {
    31337: {
      token: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    },
  }
  
  // -------------------------------
  // ERC20 ABI (standardowe funkcje)
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
  // TSender ABI (z Twojego kontraktu)
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
  