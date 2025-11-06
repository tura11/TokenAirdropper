"use client";


import Image from "next/image";
import Header from "../components/Header";
import HomeContent from "@/components/HomeContent";
import { useAccount } from "wagmi";


export default function Home() {
  const { isConnected } = useAccount();
  return (
    <div>
      {!isConnected ? (
        <div>
          Please connect the wallet
          </div>
      ) : (
        <div>
          <HomeContent />
          </div>
      )}
      </div>
  );
}