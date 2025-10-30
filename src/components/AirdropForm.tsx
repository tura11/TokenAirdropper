"use client"

import {InputForm} from "./ui/inputField"
import { useState } from "react"



export default function AirdropForm(){
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amounts, setAmounts] = useState("")

    async function handleSubmit(){
        console.log(tokenAddress, recipients, amounts)
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

            <button onClick={handleSubmit}>
                Send tokens
            </button>
        </div>
    )
}