import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Transaction } from "@/services/home/walletService"
import { formatDate } from "@/utils/dateUtils"

interface TransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
}

const TransactionDialog: React.FC<TransactionDialogProps> = ({ isOpen, onClose, transactions }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>All Transactions</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {transactions
            .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TransactionDialog

