"use client"

import { InputForm } from "./ui/inputField"
import { useMemo, useState } from "react"
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants"
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { calculateTotal } from "@/utils"

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("")
  const [recipients, setRecipients] = useState("")
  const [amounts, setAmounts] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  const chainId = useChainId()
  const config = useConfig()
  const account = useAccount()
  const total: number = useMemo(() => calculateTotal(amounts), [amounts])
  const { writeContractAsync } = useWriteContract()

  async function getApprovedAmount(tSenderAddress: string | null): Promise<bigint> {
    if (!tSenderAddress || !tokenAddress) return BigInt(0)

    try {
      const response = await readContract(config, {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "allowance",
        args: [account.address as `0x${string}`, tSenderAddress as `0x${string}`],
      })
      return BigInt(response as bigint)
    } catch (err: any) {
      console.error("❌ Token is not a valid ERC20 or contract call failed", err)
      setStatus("Invalid token address or not an ERC20 contract.")
      return BigInt(0)
    }
  }

  async function handleSubmit() {
    try {
      setStatus("⏳ Processing...")

      const tSenderAddress = chainsToTSender[chainId]?.tsender
      if (!tSenderAddress) throw new Error("No TSender address for this chain")

      const approvedAmount = await getApprovedAmount(tSenderAddress)

      if (approvedAmount < BigInt(total)) {
        setStatus("🧾 Approving token spending...")
        const approvalHash = await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [tSenderAddress as `0x${string}`, BigInt(total)],
        })
        await waitForTransactionReceipt(config, { hash: approvalHash })
        console.log("✅ Approval confirmed", approvalHash)
      }

      setStatus("🚀 Sending airdrop...")
      const tx = await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: "airdropERC20",
        args: [
          tokenAddress,
          recipients.split(/[,\n]+/).map((addr) => addr.trim()).filter(Boolean),
          amounts.split(/[,\n]+/).map((amt) => BigInt(amt.trim())).filter(Boolean),
          BigInt(total),
        ],
      })

      await waitForTransactionReceipt(config, { hash: tx })
      setStatus("✅ Airdrop successful!")
    } catch (error: any) {
      console.error(error)
      setStatus(`❌ Error: ${error.shortMessage || error.message}`)
    }
  }

  return (
    <div className="space-y-4">
      <InputForm
        label="Token Address"
        placeholder="0x..."
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />

      <InputForm
        label="Recipients"
        placeholder="0x123..., 0x456..."
        value={recipients}
        onChange={(e) => setRecipients(e.target.value)}
      />

      <InputForm
        label="Amounts"
        placeholder="1000000000000000000, 2000000000000000000"
        value={amounts}
        onChange={(e) => setAmounts(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
      >
        Send Tokens
      </button>

      {status && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300 text-sm font-medium">
          {status}
        </div>
      )}
    </div>
  )
}
