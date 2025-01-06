"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet } from 'lucide-react'
import { getWalletInfo, WalletInfo, ApiResponse } from "@/services/home/walletService"
import { useToast } from "@/components/ui/use-toast"
import BottomNav from "@/components/BottomNav"

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState("home")
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [userName, setUserName] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const response: ApiResponse<WalletInfo> = await getWalletInfo()
        if (response.success && response.data) {
          setWalletInfo(response.data)
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch wallet info.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Failed to fetch wallet info:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching wallet info.",
          variant: "destructive",
        })
      }
    }

    fetchWalletInfo()

    // Get user name from localStorage
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      const { fullName } = JSON.parse(userInfo)
      setUserName(fullName)
    }
  }, [toast])

  const handleWalletClick = () => {
    router.push('/wallet')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 pb-16">
      <main className="flex-grow p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-center">Welcome, {userName}!</h1>
          
          <Card className="mb-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleWalletClick}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">My Wallet</CardTitle>
              <Wallet className="h-6 w-6 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-2xl font-bold">${walletInfo?.balance.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Points</p>
                  <p className="text-2xl font-bold">{walletInfo?.points || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNav setCurrentPage={setCurrentPage} currentPage={currentPage} />
    </div>
  )
}

