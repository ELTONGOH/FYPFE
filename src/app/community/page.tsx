"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getAvailableCommunities, getJoinedCommunities, joinCommunity, Community } from "@/services/userCommunityService"
import BottomNav from "@/components/BottomNav"
import { useToast } from "@/components/ui/use-toast"
import CommunityCard from "@/components/CommunityCard"
import { useRouter } from 'next/navigation'

export default function CommunityPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState("community")
  const [availableCommunities, setAvailableCommunities] = useState<Community[]>([])
  const [pendingCommunities, setPendingCommunities] = useState<Community[]>([])
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    if (userRole === 'admin') {
      router.push('/admin/community')
    }
  }, [router])

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    setIsLoading(true)
    try {
      const [availableResponse, joinedResponse] = await Promise.all([
        getAvailableCommunities(),
        getJoinedCommunities()
      ])

      if (availableResponse.success && availableResponse.data) {
        const available = availableResponse.data.filter(community => community.membershipStatus === null)
        const pending = availableResponse.data.filter(community => community.membershipStatus === 'PENDING')
        setAvailableCommunities(available)
        setPendingCommunities(pending)
      } else {
        toast({
          title: "Error",
          description: availableResponse.message || "Failed to fetch available communities.",
          variant: "destructive",
        })
      }

      if (joinedResponse.success && joinedResponse.data) {
        setJoinedCommunities(joinedResponse.data)
      } else {
        toast({
          title: "Error",
          description: joinedResponse.message || "Failed to fetch joined communities.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching communities:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching communities.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinCommunity = async (communityId: number) => {
    try {
      const response = await joinCommunity(communityId);
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Successfully joined the community.",
        });
        fetchCommunities(); // Refresh the communities list
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to join the community.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while joining the community.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Community</h1>
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="joined">Joined</TabsTrigger>
          </TabsList>
          <TabsContent value="available">
            <Card>
              <CardHeader>
                <CardTitle>Available Communities</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading available communities...</p>
                ) : availableCommunities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableCommunities.map((community) => (
                      <CommunityCard 
                        key={community.communityId} 
                        community={community}
                        isAvailable={true}
                        onJoin={() => handleJoinCommunity(community.communityId)}
                      />
                    ))}
                  </div>
                ) : (
                  <p>No available communities found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Communities</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading pending communities...</p>
                ) : pendingCommunities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingCommunities.map((community) => (
                      <CommunityCard 
                        key={community.communityId} 
                        community={community} 
                      />
                    ))}
                  </div>
                ) : (
                  <p>No pending communities found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="joined">
            <Card>
              <CardHeader>
                <CardTitle>Joined Communities</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading joined communities...</p>
                ) : joinedCommunities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {joinedCommunities.map((community) => (
                      <CommunityCard 
                        key={community.communityId} 
                        community={{...community, membershipStatus: 'MEMBER'}}
                      />
                    ))}
                  </div>
                ) : (
                  <p>No joined communities found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav setCurrentPage={setCurrentPage} currentPage={currentPage} />
    </div>
  )
}

