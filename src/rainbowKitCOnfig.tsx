"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import {anvil, zksync} from 'wagmi/chains'

export default getDefaultConfig({
    appName: "TokenAirdropper",
    projectId: process.env.RAINBOWKIT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [anvil, zksync],
    ssr: false
})