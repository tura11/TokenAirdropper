"use client"

import { InputForm } from "./ui/inputField"
import { useMemo, useState, useEffect } from "react"
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants"
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { calculateTotal } from "@/utils"

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenName, setTokenName] = useState<string | null>(null)
  const [recipients, setRecipients] = useState("")
  const [amounts, setAmounts] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const chainId = useChainId()
  const config = useConfig()
  const account = useAccount()
  const total: number = useMemo(() => calculateTotal(amounts), [amounts])
  const { writeContractAsync } = useWriteContract()

  useEffect(() => {
    async function fetchTokenName() {
      if (!tokenAddress) return setTokenName(null)
      try {
        const name = await readContract(config, {
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "name",
        })
        setTokenName(name as string)
      } catch {
        setTokenName("Unknown token")
      }
    }
    fetchTokenName()
  }, [tokenAddress, config])

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
      setIsLoading(true)

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
    } finally {
      setIsLoading(false)
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

      {/* 🔍 Transaction Details */}
      <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm border border-gray-300 dark:border-gray-700">
        <p><strong>Token Name:</strong> {tokenName || "–"}</p>
        <p><strong>Amount (wei):</strong> {total}</p>
        <p><strong>Amount (tokens):</strong> {total / 1e18}</p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`px-5 py-2.5 w-full flex items-center justify-center gap-2 text-white font-semibold rounded-xl shadow-md transition-colors duration-200 ${
          isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </>
        ) : (
          "Send Tokens"
        )}
      </button>

      {/* 🔄 Status below the button */}
      {status && (
        <p className="text-sm text-gray-400 text-center mt-2">{status}</p>
      )}
    </div>
  )
}
