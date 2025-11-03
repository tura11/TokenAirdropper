import { createPublicClient, createWalletClient, http } from 'viem'
import { foundry } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')

const walletClient = createWalletClient({
  account,
  chain: foundry,
  transport: http('http://127.0.0.1:8545')
})

const publicClient = createPublicClient({
  chain: foundry,
  transport: http('http://127.0.0.1:8545')
})

async function deployMockToken() {
  const hash = await walletClient.deployContract({
    abi: [...], // ABI MockToken
    bytecode: '0x...', // Bytecode MockToken
  })
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('Mock Token deployed at:', receipt.contractAddress)
  return receipt.contractAddress
}

deployMockToken()