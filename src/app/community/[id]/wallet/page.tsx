"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import { getCommunityWallet, getCommunityTransactions, CommunityWallet, CommunityTransaction } from '@/services/general-community-service/generalCommunityService'
import { useToast } from "@/components/ui/use-toast"
import TransactionDialog from "@/components/TransactionDialog"
import { formatDate } from "@/utils/dateUtils"

export default function CommunityWalletPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [walletInfo, setWalletInfo] = useState<CommunityWallet | null>(null)
  const [transactions, setTransactions] = useState<CommunityTransaction[]>([])
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)

  useEffect(() => {
    const fetchWalletData = async () => {
      if (typeof id === 'string') {
        const communityId = parseInt(id, 10)
        try {
          const [walletResponse, transactionsResponse] = await Promise.all([
            getCommunityWallet(communityId),
            getCommunityTransactions(communityId)
          ])
          if (walletResponse.success && walletResponse.data) {
            setWalletInfo(walletResponse.data)
          } else {
            toast({
              title: "Error",
              description: walletResponse.message || "Failed to fetch community wallet info.",
              variant: "destructive",
            })
          }
          if (transactionsResponse.success && transactionsResponse.data) {
            setTransactions(transactionsResponse.data)
          } else {
            toast({
              title: "Error",
              description: transactionsResponse.message || "Failed to fetch community transactions.",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error('Failed to fetch community wallet data:', error)
          toast({
            title: "Error",
            description: "An unexpected error occurred while fetching community wallet data.",
            variant: "destructive",
          })
        }
      }
    }

    fetchWalletData()
  }, [id, toast])

  const handleBack = () => {
    const status = searchParams.get('status') || 'NOT_MEMBER'
    router.push(`/community/${id}?status=${status}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-md mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Community
        </button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Community Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <p className="text-xl font-bold">${walletInfo?.balance.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Points</p>
                <p className="text-xl font-bold">{walletInfo?.points || '0'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">On-Hold</p>
                <p className="text-xl font-bold">${walletInfo?.onHoldBalance.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions
              .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
              .slice(0, 3)
              .map((transaction) => (
                <div key={transaction.transactionId} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{transaction.type}</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.transactionDate)}</p>
                  </div>
                  <p className={`font-bold ${transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            <Button 
              onClick={() => setIsTransactionDialogOpen(true)} 
              className="w-full mt-4"
            >
              View More
            </Button>
          </CardContent>
        </Card>
      </div>
      <TransactionDialog 
        isOpen={isTransactionDialogOpen} 
        onClose={() => setIsTransactionDialogOpen(false)} 
        transactions={transactions as any} // Type assertion to avoid type mismatch
      />
    </div>
  )
}

