"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { getAllAdvertisements, Advertisement, distributeRewards, approveAdvertisement, rejectAdvertisement, downrackAdvertisement, validateAdvertisements } from '@/services/adminAdvertisementService'
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

export default function ManageAdvertisementsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchAdvertisements()
  }, [id])

  const fetchAdvertisements = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      setIsLoading(true)
      try {
        await validateAdvertisements(communityId);
        const response = await getAllAdvertisements(communityId)
        if (response.success && response.data) {
          setAdvertisements(response.data)
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
    router.push(`/admin/community/${id}`)
  }

  const handleDistributeReward = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      try {
        const response = await distributeRewards(communityId)
        if (response.success) {
          toast({
            title: "Success",
            description: response.message || "Rewards distributed successfully.",
          })
          await fetchAdvertisements()
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to distribute rewards.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error distributing rewards:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while processing the reward distribution.",
          variant: "destructive",
        })
      }
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

  const handleAccept = async (advertisementId: number) => {
    try {
      const response = await approveAdvertisement(advertisementId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Advertisement approved successfully.",
        });
        setIsDialogOpen(false);
        await fetchAdvertisements();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to approve advertisement.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving advertisement:", error);
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while approving the advertisement.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (advertisementId: number) => {
    try {
      const response = await rejectAdvertisement(advertisementId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Advertisement rejected successfully.",
        });
        setIsDialogOpen(false);
        await fetchAdvertisements();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to reject advertisement.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting advertisement:", error);
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while rejecting the advertisement.",
        variant: "destructive",
      });
    }
  };

  const renderAdvertisementList = (status: string) => {
    const filteredAds = advertisements.filter(ad => ad.status === status)
    return (
      <div className="relative">
        <div className="flex overflow-x-auto space-x-4 p-4">
          {filteredAds.length > 0 ? (
            filteredAds.slice(0, 5).map((ad) => (
              <Card key={ad.advertisementId} className="flex-shrink-0 w-64">
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">{ad.title}</h3>
                  <div className="mb-2">
                    <AdTypeTag type={ad.type} />
                  </div>
                  <p className="text-sm mb-1">Fee: ${ad.fee}</p>
                  <p className="text-sm mb-2">Duration: {ad.uploadDuration} days</p>
                  {status !== 'PENDING' && (
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
            ))
          ) : (
            <p>No {status.toLowerCase()} advertisements found.</p>
          )}
        </div>
        {filteredAds.length > 0 && (
          <div className="flex justify-end mt-2">
            <Button 
              variant="outline"
              onClick={() => router.push(`/admin/community/${id}/manage-advertisements/${status.toLowerCase().replace(' ', '-')}`)}
              className="text-sm"
            >
              View More <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  const pendingAdsCount = advertisements.filter(ad => ad.status === 'PENDING').length
  const onBoardAdsCount = advertisements.filter(ad => ad.status === 'ON BOARD').length

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-4xl mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Community
        </button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Manage Advertisements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Button onClick={handleDistributeReward} className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded">
                Distribute Advertisement Reward
              </Button>
            </div>

            {isLoading ? (
              <p>Loading advertisements...</p>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    Pending Advertisements <StatusTag status="PENDING" />
                  </h2>
                  {renderAdvertisementList('PENDING')}
                </div>

                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    On Board Advertisements <StatusTag status="ON BOARD" />
                  </h2>
                  {renderAdvertisementList('ON BOARD')}
                </div>
              </>
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

