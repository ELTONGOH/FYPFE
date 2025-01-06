"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { getAllAdvertisements, Advertisement, approveAdvertisement, rejectAdvertisement, downrackAdvertisement, validateAdvertisements } from '@/services/adminAdvertisementService'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const StatusTag = ({ status }: { status: string }) => {
  const color = status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800';
  return (
    <span className={`inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      {status}
    </span>
  );
};

const AdTypeTag = ({ type }: { type: string }) => {
  const isNonProfit = type.toLowerCase().includes('non-profit');
  const color = isNonProfit ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800';
  const displayText = isNonProfit ? 'Non-Profit Ad' : 'Profit Ad';
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {displayText}
    </span>
  );
};

export default function AdvertisementListPage() {
  const params = useParams()
  const id = params.id as string
  const status = params.status as string
  const router = useRouter()
  const { toast } = useToast()
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchAdvertisements()
  }, [id, status])

  const fetchAdvertisements = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      setIsLoading(true)
      try {
        await validateAdvertisements(communityId);
        const response = await getAllAdvertisements(communityId)
        if (response.success && response.data) {
          const filteredAds = response.data.filter(ad => ad.status === status.toUpperCase().replace('-', ' '))
          setAdvertisements(filteredAds)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch advertisements.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching advertisements.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBack = () => {
    router.push(`/admin/community/${id}/manage-advertisements`)
  }

  const handleAccept = async (advertisementId: number) => {
    try {
      const response = await approveAdvertisement(advertisementId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Advertisement approved successfully.",
        })
        setIsDialogOpen(false)
        await fetchAdvertisements()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to approve advertisement.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error approving advertisement:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while approving the advertisement.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (advertisementId: number) => {
    try {
      const response = await rejectAdvertisement(advertisementId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Advertisement rejected successfully.",
        })
        setIsDialogOpen(false)
        await fetchAdvertisements()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to reject advertisement.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error rejecting advertisement:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while rejecting the advertisement.",
        variant: "destructive",
      })
    }
  }

  const handleDownrack = async (advertisementId: number) => {
    try {
      const response = await downrackAdvertisement(advertisementId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Advertisement downracked successfully.",
        })
        setIsDialogOpen(false)
        await fetchAdvertisements()
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

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-4xl mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Manage Advertisements
        </button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')} Advertisements
              <StatusTag status={status.toUpperCase().replace('-', ' ')} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading advertisements...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advertisements.map((ad) => (
                  <Card key={ad.advertisementId}>
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-2">{ad.title}</h3>
                      <div className="mb-2">
                        <AdTypeTag type={ad.type} />
                      </div>
                      <p className="text-sm mb-1">Fee: ${ad.fee}</p>
                      <p className="text-sm mb-2">Duration: {ad.uploadDuration} days</p>
                      {status !== 'pending' && (
                        <p className="text-sm mb-2">Upload At: {new Date(ad.uploadAt).toLocaleDateString()}</p>
                      )}
                      <Button onClick={() => {
                        setSelectedAd(ad)
                        setIsDialogOpen(true)
                      }}>
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAd?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedAd?.mediaUrls && selectedAd.mediaUrls.length > 0 ? (
              <div className="mb-4">
                <Image
                  src={selectedAd.mediaUrls[0].mediaUrl}
                  alt={selectedAd.title}
                  width={300}
                  height={200}
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            ) : (
              <div className="mb-4">
                <Image
                  src="/placeholder.svg"
                  alt="Placeholder"
                  width={300}
                  height={200}
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            )}
            <p><strong>Description:</strong> {selectedAd?.description}</p>
            <p><strong>Type:</strong> <AdTypeTag type={selectedAd?.type || ''} /></p>
            <p><strong>Fee:</strong> ${selectedAd?.fee}</p>
            <p><strong>Upload Duration:</strong> {selectedAd?.uploadDuration} days</p>
            <p><strong>Status:</strong> <StatusTag status={selectedAd?.status || ''} /></p>
            <p><strong>Created At:</strong> {new Date(selectedAd?.createdAt || '').toLocaleString()}</p>
            {selectedAd?.status !== 'PENDING' && (
              <p><strong>Upload At:</strong> {new Date(selectedAd?.uploadAt || '').toLocaleString()}</p>
            )}
          </div>
          <DialogFooter>
            {selectedAd?.status === 'PENDING' && (
              <>
                <Button onClick={() => handleReject(selectedAd.advertisementId)} variant="destructive">
                  Reject
                </Button>
                <Button onClick={() => handleAccept(selectedAd.advertisementId)}>
                  Accept
                </Button>
              </>
            )}
            {selectedAd?.status === 'ON BOARD' && (
              <Button 
                onClick={() => handleDownrack(selectedAd.advertisementId)}
                variant="destructive"
              >
                Downrack Advertisement
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

