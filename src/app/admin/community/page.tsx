"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import BottomNav from "@/components/BottomNav"
import CommunityCard from "@/components/CommunityCard"
import { getAdminCommunities, AdminCommunity } from '@/services/adminCommunityService'

export default function AdminCommunityPage() {
  const [currentPage, setCurrentPage] = useState("community")
  const [adminCommunities, setAdminCommunities] = useState<AdminCommunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAdminCommunities = async () => {
      setIsLoading(true)
      try {
        const response = await getAdminCommunities()
        if (response.success && response.data) {
          setAdminCommunities(response.data)
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch admin communities.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching admin communities:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching admin communities.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminCommunities()
  }, [toast])

  const handleManageCommunity = (community: AdminCommunity) => {
    const queryParams = new URLSearchParams({
      name: community.name ?? 'Unnamed Community',
      maxParticipation: (community.maxParticipation ?? 0).toString(),
      adminName: community.adminName ?? 'Unknown Admin',
      memberSharePercentage: (community.memberSharePercentage ?? 0).toString(),
      managementSharePercentage: (community.managementSharePercentage ?? 0).toString(),
      rewardCommunityPercentage: (community.rewardDistribution?.communityPercentage ?? 0).toString(),
      rewardTaskParticipantPercentage: (community.rewardDistribution?.taskParticipantPercentage ?? 0).toString(),
      adUserPercentage: (community.advertisementDistribution?.userPercentage ?? 0).toString(),
      adCommunityPercentage: (community.advertisementDistribution?.communityPercentage ?? 0).toString(),
    }).toString();

    router.push(`/admin/community/${community.communityId}?${queryParams}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Community Management</h1>
        {adminCommunities.length < 2 && (
          <Button onClick={() => router.push('/admin/community/create')} className="mb-4">
            Create New Community
          </Button>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Communities You Manage</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading admin communities...</p>
            ) : adminCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminCommunities.map((community) => (
                  <CommunityCard 
                    key={community.communityId} 
                    community={community} 
                    isAdmin={true}
                    onManage={() => handleManageCommunity(community)}
                  />
                ))}
              </div>
            ) : (
              <p>No communities found.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav setCurrentPage={setCurrentPage} currentPage={currentPage} />
    </div>
  )
}

