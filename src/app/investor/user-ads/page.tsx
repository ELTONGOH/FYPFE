"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getInvestorAds, downrackAdvertisement, Advertisement } from '@/services/investorAdsService'
import BottomNav from "@/components/BottomNav"
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function UserAdsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [ads, setAds] = useState<Advertisement[]>([])
  const [currentSection, setCurrentSection] = useState("investor")
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDownrackDialogOpen, setIsDownrackDialogOpen] = useState(false)
  const [adToDownrack, setAdToDownrack] = useState<number | null>(null)

  useEffect(() => {
    fetchUserAds()
  }, [])

  const fetchUserAds = async () => {
    try {
      const response = await getInvestorAds()
      if (response.success && response.data) {
        setAds(response.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch your advertisements.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching your advertisements.",
        variant: "destructive",
      })
    }
  }

  const handleDownrack = async (adId: number) => {
    setAdToDownrack(adId)
    setIsDownrackDialogOpen(true)
  }

  const confirmDownrack = async () => {
    if (adToDownrack) {
      try {
        const response = await downrackAdvertisement(adToDownrack)
        if (response.success) {
          toast({
            title: "Success",
            description: "Advertisement has been downracked successfully.",
          })
          fetchUserAds() // Refresh the ads list
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to downrack advertisement.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error downracking advertisement:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while downracking the advertisement.",
          variant: "destructive",
        })
      }
    }
    setIsDownrackDialogOpen(false)
    setAdToDownrack(null)
  }

  const AdCard: React.FC<{ ad: Advertisement }> = ({ ad }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg mb-2">{ad.title}</h3>
            <p className="text-sm text-gray-600 mb-2">Status: {ad.status}</p>
            <p className="text-sm text-gray-600 mb-2">Type: {ad.type}</p>
            <p className="text-sm text-gray-600">Created: {new Date(ad.createdAt).toLocaleDateString()}</p>
          </div>
          {ad.mediaUrls && ad.mediaUrls.length > 0 && (
            <div className="w-24 h-24 relative">
              <Image
                src={ad.mediaUrls[0].mediaUrl}
                alt={ad.title}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Button onClick={() => {
            setSelectedAd(ad)
            setIsDetailsOpen(true)
          }}>
            View Details
          </Button>
          {ad.status === "ON BOARD" && (
            <Button variant="destructive" onClick={() => handleDownrack(ad.advertisementId)}>
              Downrack
            </Button>
          )}
          {ad.status === "PENDING" && (
            <span className="text-yellow-600 font-semibold">Pending Approval</span>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Your Advertisements</h1>

        {ads.length === 0 ? (
          <p>You haven't created any advertisements yet.</p>
        ) : (
          ads.map((ad) => <AdCard key={ad.advertisementId} ad={ad} />)
        )}

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedAd?.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">{selectedAd?.description}</p>
              <p className="text-sm text-gray-600 mb-2">Status: {selectedAd?.status}</p>
              <p className="text-sm text-gray-600 mb-2">Type: {selectedAd?.type}</p>
              <p className="text-sm text-gray-600 mb-2">Fee: ${selectedAd?.fee.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mb-2">Upload Duration: {selectedAd?.uploadDuration} days</p>
              <p className="text-sm text-gray-600 mb-2">Created: {selectedAd?.createdAt ? new Date(selectedAd.createdAt).toLocaleString() : 'N/A'}</p>
              <p className="text-sm text-gray-600 mb-2">Upload At: {selectedAd?.uploadAt ? new Date(selectedAd.uploadAt).toLocaleString() : 'N/A'}</p>
              {selectedAd?.mediaUrls && selectedAd.mediaUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">Advertisement Image:</p>
                  <div className="w-full h-48 relative">
                    <Image
                      src={selectedAd.mediaUrls[0].mediaUrl}
                      alt={selectedAd.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={isDownrackDialogOpen} onOpenChange={setIsDownrackDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Downrack</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to downrack this advertisement? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAdToDownrack(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDownrack}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <BottomNav setCurrentPage={setCurrentSection} currentPage={currentSection} />
    </div>
  )
}

