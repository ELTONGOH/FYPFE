"use client"

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getAllCommunities, Community } from '@/services/userCommunityService'
import { getInvestorAds, createAdvertisement, downrackAdvertisement, Advertisement } from '@/services/investorAdsService'
import { CreateAdForm } from './CreateAdForm'

export default function InvestorAdvertisement() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [ads, setAds] = useState<Advertisement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateAdDialogOpen, setIsCreateAdDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [communitiesResponse, adsResponse] = await Promise.all([
          getAllCommunities(),
          getInvestorAds()
        ])
        if (communitiesResponse.success && communitiesResponse.data) {
          setCommunities(communitiesResponse.data)
        }
        if (adsResponse.success && adsResponse.data) {
          setAds(adsResponse.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const handleCreateAd = async (adData: any) => {
    try {
      const response = await createAdvertisement(adData)
      if (response.success) {
        toast({
          title: "Success",
          description: "Advertisement created successfully.",
        })
        setIsCreateAdDialogOpen(false)
        // Refresh ads
        const adsResponse = await getInvestorAds()
        if (adsResponse.success && adsResponse.data) {
          setAds(adsResponse.data)
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create advertisement.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating advertisement:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownrackAd = async (advertisementId: number) => {
    try {
      const response = await downrackAdvertisement(advertisementId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Advertisement downracked successfully.",
        })
        // Refresh ads
        const adsResponse = await getInvestorAds()
        if (adsResponse.success && adsResponse.data) {
          setAds(adsResponse.data)
        }
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
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investor Advertisement Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all-communities">
          <TabsList>
            <TabsTrigger value="all-communities">All Communities</TabsTrigger>
            <TabsTrigger value="your-ads">Your Ads</TabsTrigger>
          </TabsList>
          <TabsContent value="all-communities">
            <h3 className="text-lg font-semibold mb-4">Available Communities</h3>
            {isLoading ? (
              <p>Loading communities...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {communities.map((community) => (
                  <Card key={community.communityId}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{community.name}</h4>
                      <p className="text-sm text-gray-600">Members: {community.totalMembers}</p>
                      <Button 
                        onClick={() => setIsCreateAdDialogOpen(true)} 
                        className="mt-2"
                      >
                        Create Ad
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="your-ads">
            <h3 className="text-lg font-semibold mb-4">Your Advertisements</h3>
            {isLoading ? (
              <p>Loading your ads...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ads.map((ad) => (
                  <Card key={ad.advertisementId}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{ad.title}</h4>
                      <p className="text-sm text-gray-600">Status: {ad.status}</p>
                      <p className="text-sm text-gray-600">Type: {ad.type}</p>
                      <p className="text-sm text-gray-600">Fee: ${ad.fee.toFixed(2)}</p>
                      {ad.status === 'ON BOARD' && (
                        <Button 
                          onClick={() => handleDownrackAd(ad.advertisementId)} 
                          variant="destructive" 
                          className="mt-2"
                        >
                          Downrack
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      {isCreateAdDialogOpen && (
        <CreateAdForm 
          onClose={() => setIsCreateAdDialogOpen(false)}
          onSubmit={handleCreateAd}
          communities={communities}
        />
      )}
    </Card>
  )
}

