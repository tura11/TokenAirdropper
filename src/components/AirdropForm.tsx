"use client"

import { InputForm } from "./ui/inputField"
import { useMemo, useState, useEffect } from "react"
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants"
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { calculateTotal } from "@/utils"
import { Upload, AlertCircle, CheckCircle, Loader, TrendingUp, History, FileText } from "lucide-react"

interface Transaction {
  hash: string
  timestamp: number
  recipients: number
  totalAmount: string
  tokenName: string
  status: 'pending' | 'success' | 'failed'
}

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenName, setTokenName] = useState<string | null>(null)
  const [tokenBalance, setTokenBalance] = useState<string | null>(null)
  const [recipients, setRecipients] = useState("")
  const [amounts, setAmounts] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [gasEstimate, setGasEstimate] = useState<string | null>(null)
  const [txHistory, setTxHistory] = useState<Transaction[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const chainId = useChainId()
  const config = useConfig()
  const account = useAccount()
  const total: number = useMemo(() => calculateTotal(amounts), [amounts])
  const { writeContractAsync } = useWriteContract()

  // Validate Ethereum address
  const isValidAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr)
  }

  // Fetch token info (name + balance)
  useEffect(() => {
    async function fetchTokenInfo() {
      if (!tokenAddress || !account.address) {
        setTokenName(null)
        setTokenBalance(null)
        return
      }

      try {
        const [name, balance] = await Promise.all([
          readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "name",
          }),
          readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "balanceOf",
            args: [account.address],
          })
        ])
        
        setTokenName(name as string)
        setTokenBalance((Number(balance) / 1e18).toFixed(4))
      } catch {
        setTokenName("Unknown token")
        setTokenBalance(null)
      }
    }
    fetchTokenInfo()
  }, [tokenAddress, config, account.address])

  // Validate recipients in real-time
  useEffect(() => {
    const recipientList = recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(Boolean)
    const errors: string[] = []

    recipientList.forEach((addr, idx) => {
      if (!isValidAddress(addr)) {
        errors.push(`Invalid address at position ${idx + 1}: ${addr.slice(0, 10)}...`)
      }
    })

    setValidationErrors(errors)

    // Gas estimation
    if (recipientList.length > 0 && errors.length === 0) {
      const estimatedGas = (recipientList.length * 65000 * 0.00000002).toFixed(6)
      setGasEstimate(estimatedGas)
    } else {
      setGasEstimate(null)
    }
  }, [recipients])

  // Handle CSV upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      
      const newRecipients: string[] = []
      const newAmounts: string[] = []

      lines.forEach(line => {
        const [address, amount] = line.split(',').map(s => s.trim())
        if (address && amount) {
          newRecipients.push(address)
          // Convert to wei if needed
          const weiAmount = amount.includes('.') 
            ? BigInt(Math.floor(parseFloat(amount) * 1e18)).toString()
            : amount
          newAmounts.push(weiAmount)
        }
      })

      setRecipients(newRecipients.join('\n'))
      setAmounts(newAmounts.join('\n'))
    }
    reader.readAsText(file)
  }

  // Load transaction history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('airdrop_history')
    if (stored) {
      setTxHistory(JSON.parse(stored))
    }
  }, [])

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
    // Pre-validation
    if (validationErrors.length > 0) {
      setStatus("❌ Fix validation errors first!")
      return
    }

    const recipientList = recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(Boolean)
    const amountList = amounts.split(/[,\n]+/).map(amt => BigInt(amt.trim())).filter(Boolean)

    if (recipientList.length !== amountList.length) {
      setStatus("❌ Number of recipients must match number of amounts!")
      return
    }

    try {
      setStatus("⏳ Processing...")
      setIsLoading(true)
      setProgress(0)

      const tSenderAddress = chainsToTSender[chainId]?.tsender
      if (!tSenderAddress) throw new Error("No TSender address for this chain")

      setProgress(20)
      const approvedAmount = await getApprovedAmount(tSenderAddress)

      if (approvedAmount < BigInt(total)) {
        setStatus("🧾 Approving token spending...")
        setProgress(40)
        
        const approvalHash = await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [tSenderAddress as `0x${string}`, BigInt(total)],
        })
        await waitForTransactionReceipt(config, { hash: approvalHash })
      }

      setStatus("🚀 Sending airdrop...")
      setProgress(70)
      
      const tx = await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: "airdropERC20",
        args: [
          tokenAddress,
          recipientList,
          amountList,
          BigInt(total),
        ],
      })

      setProgress(90)
      await waitForTransactionReceipt(config, { hash: tx })
      
      setProgress(100)
      setStatus("✅ Airdrop successful!")

      // Save to history
      const newTx: Transaction = {
        hash: tx,
        timestamp: Date.now(),
        recipients: recipientList.length,
        totalAmount: (total / 1e18).toFixed(4),
        tokenName: tokenName || 'Unknown',
        status: 'success'
      }
      
      const updatedHistory = [newTx, ...txHistory].slice(0, 10) // Keep last 10
      setTxHistory(updatedHistory)
      localStorage.setItem('airdrop_history', JSON.stringify(updatedHistory))

      // Clear form
      setTimeout(() => {
        setRecipients("")
        setAmounts("")
        setProgress(0)
      }, 2000)

    } catch (error: any) {
      console.error(error)
      setStatus(`❌ Error: ${error.shortMessage || error.message}`)
      setProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  const recipientCount = recipients.split(/[,\n]+/).filter(Boolean).length

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Token Info Section */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Token Configuration
        </h3>
        
        <InputForm
          label="Token Address"
          placeholder="0x..."
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
        />

        {tokenBalance && (
          <div className="mt-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-60">Your Balance</p>
                <p className="text-2xl font-bold text-green-500">{tokenBalance} {tokenName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-60">Token Name</p>
                <p className="font-semibold">{tokenName || "–"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSV Upload Section */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Recipients
        </h3>

        <label className="flex items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg cursor-pointer transition-all group">
          <Upload className="w-6 h-6 group-hover:text-blue-500 transition-colors" />
          <div className="text-center">
            <p className="font-medium group-hover:text-blue-500 transition-colors">
              Upload CSV File
            </p>
            <p className="text-sm opacity-60 mt-1">Format: address,amount (one per line)</p>
          </div>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <div className="text-center text-sm opacity-60 my-4">OR</div>

        {/* Manual Input */}
        <div className="space-y-4">
          <InputForm
            label="Recipients (one per line or comma-separated)"
            placeholder="0x123...abc&#10;0x456...def"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            multiline
          />

          <InputForm
            label="Amounts in wei (one per line or comma-separated)"
            placeholder="1000000000000000000&#10;2000000000000000000"
            value={amounts}
            onChange={(e) => setAmounts(e.target.value)}
            multiline
          />
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-700 dark:text-red-400 mb-2">
                Validation Errors ({validationErrors.length})
              </p>
              <div className="space-y-1 text-sm text-red-600 dark:text-red-300">
                {validationErrors.slice(0, 3).map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
                {validationErrors.length > 3 && (
                  <p className="opacity-60">... and {validationErrors.length - 3} more</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats & Gas Estimate */}
      {recipientCount > 0 && validationErrors.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm opacity-60 mb-1">Recipients</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{recipientCount}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm opacity-60 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {(total / 1e18).toFixed(4)}
            </p>
          </div>

          {gasEstimate && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <p className="text-sm opacity-60 mb-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Gas Estimate
              </p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                ~{gasEstimate} ETH
              </p>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      {isLoading && (
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Loader className="w-5 h-5 animate-spin text-blue-500" />
            <span className="font-medium">{status}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm opacity-60 mt-2">{progress}%</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || validationErrors.length > 0 || recipientCount === 0}
        className={`px-6 py-4 w-full flex items-center justify-center gap-3 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 ${
          isLoading || validationErrors.length > 0 || recipientCount === 0
            ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" 
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
        }`}
      >
        {isLoading ? (
          <>
            <Loader className="w-6 h-6 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle className="w-6 h-6" />
            Execute Airdrop
          </>
        )}
      </button>

      {/* Status Message */}
      {status && !isLoading && (
        <div className={`p-4 rounded-xl text-center font-medium ${
          status.includes('✅') 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : status.includes('❌')
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
        }`}>
          {status}
        </div>
      )}

      {/* Transaction History */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between font-bold text-lg mb-4"
        >
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History ({txHistory.length})
          </div>
          <span className="text-2xl">{showHistory ? '−' : '+'}</span>
        </button>

        {showHistory && (
          <div className="space-y-3 mt-4">
            {txHistory.length === 0 ? (
              <p className="text-center text-sm opacity-60 py-4">No transactions yet</p>
            ) : (
              txHistory.map((tx) => (
                <div key={tx.hash} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-semibold">{tx.recipients} recipients</span>
                    </div>
                    <span className="text-xs opacity-60">
                      {new Date(tx.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-mono opacity-60 mb-2">
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-60">{tx.tokenName}</span>
                    <span className="font-bold text-green-500">{tx.totalAmount} tokens</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}