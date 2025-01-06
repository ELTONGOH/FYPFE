"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, PlusCircle, MinusCircle } from 'lucide-react'
import { getWalletInfo, getTransactions, topUpWallet, withdrawFromWallet, WalletInfo, Transaction } from "@/services/home/walletService"
import BottomNav from "@/components/BottomNav"
import { useToast } from "@/components/ui/use-toast"
import TransactionDialog from "@/components/TransactionDialog"
import { formatDate } from "@/utils/dateUtils"

export default function WalletPage() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentPage, setCurrentPage] = useState("wallet")
  const [topUpAmount, setTopUpAmount] = useState("")
  const [cardNumber1, setCardNumber1] = useState("")
  const [cardNumber2, setCardNumber2] = useState("")
  const [cardNumber3, setCardNumber3] = useState("")
  const [cardNumber4, setCardNumber4] = useState("")
  const [cardExpiryMonth, setCardExpiryMonth] = useState("")
  const [cardExpiryYear, setCardExpiryYear] = useState("")
  const [cardCVV, setCardCVV] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [bankAccount, setBankAccount] = useState("")
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false)
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      const [walletResponse, transactionsResponse] = await Promise.all([
        getWalletInfo(),
        getTransactions()
      ])
      if (walletResponse.success && walletResponse.data) {
        setWalletInfo(walletResponse.data)
      } else {
        toast({
          title: "Error",
          description: walletResponse.message || "Failed to fetch wallet info.",
          variant: "destructive",
        })
      }
      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data)
      } else {
        toast({
          title: "Error",
          description: transactionsResponse.message || "Failed to fetch transactions.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch wallet data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBack = () => {
    router.push('/home')
  }

  const handleTopUp = async () => {
    if (!validateCard()) {
      toast({
        title: "Invalid Card Information",
        description: "Please check your card details and try again.",
        variant: "destructive",
      })
      return
    }

    const fullCardNumber = cardNumber1 + cardNumber2 + cardNumber3 + cardNumber4
    const amount = parseFloat(topUpAmount)

    try {
      const response = await topUpWallet(amount)
      if (response.success && response.data) {
        setWalletInfo(response.data)
        toast({
          title: "Top-up Successful",
          description: response.message || `Successfully added $${amount.toFixed(2)} to your wallet.`,
        })
        // Reset form fields
        setTopUpAmount("")
        setCardNumber1("")
        setCardNumber2("")
        setCardNumber3("")
        setCardNumber4("")
        setCardExpiryMonth("")
        setCardExpiryYear("")
        setCardCVV("")
        setIsTopUpDialogOpen(false)
        fetchWalletData() // Refresh wallet data
      } else {
        toast({
          title: "Top-up Failed",
          description: response.message || "An error occurred during top-up. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Top-up error:', error)
      toast({
        title: "Top-up Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleWithdraw = async () => {
    if (!selectedBank || !bankAccount) {
      toast({
        title: "Incomplete Information",
        description: "Please select a bank and enter your account number.",
        variant: "destructive",
      })
      return
    }

    try {
      const amount = parseFloat(withdrawAmount)
      const response = await withdrawFromWallet(amount)
      if (response.success && response.data) {
        setWalletInfo(response.data)
        toast({
          title: "Withdrawal Successful",
          description: response.message || `Successfully withdrawn $${amount.toFixed(2)} from your wallet.`,
        })
        // Reset form fields
        setWithdrawAmount("")
        setSelectedBank("")
        setBankAccount("")
        setIsWithdrawDialogOpen(false)
        fetchWalletData() // Refresh wallet data
      } else {
        toast({
          title: "Withdrawal Failed",
          description: response.message || "An error occurred during withdrawal. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Withdrawal error:', error)
      toast({
        title: "Withdrawal Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const validateCard = () => {
    const fullCardNumber = cardNumber1 + cardNumber2 + cardNumber3 + cardNumber4
    return (
      fullCardNumber.length === 16 &&
      cardExpiryMonth.length === 2 &&
      cardExpiryYear.length === 2 &&
      cardCVV.length === 3
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-md mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Home
        </button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">My Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <p className="text-3xl font-bold">${walletInfo?.balance.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Points</p>
                <p className="text-3xl font-bold">{walletInfo?.points || '0'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center justify-center bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition-colors">
                    <PlusCircle className="mr-2" /> Top Up
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Top Up Your Wallet</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="topup-amount" className="text-right">
                        Amount
                      </Label>
                      <Input
                        id="topup-amount"
                        type="number"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="card-number-1" className="text-right">
                        Card Number
                      </Label>
                      <div></div><div></div><div></div>
                      <Input
                        id="card-number-1"
                        value={cardNumber1}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setCardNumber1(value)
                          if (value.length === 4) {
                            document.getElementById('card-number-2')?.focus()
                          }
                        }}
                        className="col-span-3/4"
                        maxLength={4}
                      />
                      <Input
                        id="card-number-2"
                        value={cardNumber2}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setCardNumber2(value)
                          if (value.length === 4) {
                            document.getElementById('card-number-3')?.focus()
                          }
                        }}
                        className="col-span-3/4"
                        maxLength={4}
                      />
                      <Input
                        id="card-number-3"
                        value={cardNumber3}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setCardNumber3(value)
                          if (value.length === 4) {
                            document.getElementById('card-number-4')?.focus()
                          }
                        }}
                        className="col-span-3/4"
                        maxLength={4}
                      />
                      <Input
                        id="card-number-4"
                        value={cardNumber4}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setCardNumber4(value)
                        }}
                        className="col-span-3/4"
                        maxLength={4}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="card-expiry-month" className="text-right">
                        Expiry
                      </Label>
                      <div className="col-span-3 flex items-center">
                        <Input
                          id="card-expiry-month"
                          value={cardExpiryMonth}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                            setCardExpiryMonth(value)
                            if (value.length === 2) {
                              document.getElementById('card-expiry-year')?.focus()
                            }
                          }}
                          className="w-20 text-center"
                          maxLength={2}
                          placeholder="MM"
                        />
                        <span className="mx-2">/</span>
                        <Input
                          id="card-expiry-year"
                          value={cardExpiryYear}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 2)
                            setCardExpiryYear(value)
                          }}
                          className="w-20 text-center"
                          maxLength={2}
                          placeholder="YY"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="card-cvv" className="text-right">
                        CVV
                      </Label>
                      <Input
                        id="card-cvv"
                        value={cardCVV}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                          setCardCVV(value)
                        }}
                        className="col-span-3"
                        maxLength={3}
                      />
                    </div>
                  </div>
                  <Button onClick={handleTopUp}>Top Up</Button>
                </DialogContent>
              </Dialog>
              <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition-colors">
                    <MinusCircle className="mr-2" /> Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="withdraw-amount" className="text-right">
                        Amount
                      </Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="bank-select" className="text-right">
                        Bank
                      </Label>
                      <Select onValueChange={setSelectedBank} value={selectedBank}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maybank">Maybank</SelectItem>
                          <SelectItem value="publicbank">Public Bank</SelectItem>
                          <SelectItem value="hongleongbank">Hong Leong Bank</SelectItem>
                          <SelectItem value="cimbbank">CIMB Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="bank-account" className="text-right">
                        Account Number
                      </Label>
                      <Input
                        id="bank-account"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <Button onClick={handleWithdraw}>Withdraw</Button>
                </DialogContent>
              </Dialog>
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
      <BottomNav setCurrentPage={setCurrentPage} currentPage={currentPage} />
      <TransactionDialog 
        isOpen={isTransactionDialogOpen} 
        onClose={() => setIsTransactionDialogOpen(false)} 
        transactions={transactions}
      />
    </div>
  )
}

