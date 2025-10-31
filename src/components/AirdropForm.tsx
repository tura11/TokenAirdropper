"use client"

import {InputForm} from "./ui/inputField"
import { useState } from "react"
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants"
import {useChainId, useConfig, useReadContract, useAccount} from "wagmi"
import {readContract}   from "@wagmi/core"


export default function AirdropForm(){
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amounts, setAmounts] = useState("")
    const chainId = useChainId()
    const config = useConfig()
    const account = useAccount()

    async function getApprovedAmount(tSenderAddress: string | null):Promise<number> {
        if(!tSenderAddress){
            alert("No address found")
            return 0
        }
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tSenderAddress as `0x${string}`]
        })
        //token.allowance(account,tsender)
        return response as number
    } 

    async function handleSubmit(){
        const tSenderAddress = chainsToTSender[chainId]["tsender"]
        const approvedAmount = await getApprovedAmount(tSenderAddress)
        
    }

    return(
        <div>
            <InputForm
            label="Token Address"
            placeholder="0x"
            value={tokenAddress}
            onChange={e => setTokenAddress(e.target.value)}
            />

            <InputForm
            label="Recipients"
            placeholder="0x123456, 0x123"
            value={recipients}
            onChange={e => setRecipients(e.target.value)}
            />
            <InputForm
            label="Amounts"
            placeholder="100, 200"
            value={amounts}
            onChange={e => setAmounts(e.target.value)}
            />

            <button
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200"
                >
                Send tokens
            </button>
        </div>
    )
}