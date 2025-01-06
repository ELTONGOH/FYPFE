"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { getAdminCommunities, AdminCommunity, updateCommunity, updateAdvertisementDistribution } from '@/services/adminCommunityService'

export default function UpdateCommunityPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [communityData, setCommunityData] = useState<AdminCommunity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [communityForm, setCommunityForm] = useState({
    maxParticipation: 0,
    memberSharePercentage: 0,
    managementSharePercentage: 0,
    communityPercentage: 0,
    taskParticipantPercentage: 0,
  })
  const [adForm, setAdForm] = useState({
    userPercentage: 0,
    communityPercentage: 0,
  })
  const [isCommunityChanged, setIsCommunityChanged] = useState(false)
  const [isAdChanged, setIsAdChanged] = useState(false)
  const [formErrors, setFormErrors] = useState({
    community: false,
    ad: false,
  })

  useEffect(() => {
    fetchCommunityData()
  }, [id])

  const fetchCommunityData = async () => {
    if (typeof id === 'string') {
      setIsLoading(true)
      try {
        const response = await getAdminCommunities()
        if (response.success && response.data) {
          const community = response.data.find(c => c.communityId === parseInt(id, 10))
          if (community) {
            setCommunityData(community)
            setCommunityForm({
              maxParticipation: community.maxParticipation || 0,
              memberSharePercentage: community.memberSharePercentage || 0,
              managementSharePercentage: community.managementSharePercentage || 0,
              communityPercentage: community.rewardDistribution?.communityPercentage || 0,
              taskParticipantPercentage: community.rewardDistribution?.taskParticipantPercentage || 0,
            })
            setAdForm({
              userPercentage: community.advertisementDistribution?.userPercentage || 0,
              communityPercentage: community.advertisementDistribution?.communityPercentage || 0,
            })
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch community data.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching community data:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching community data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCommunityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = value === '' ? 0 : parseFloat(value)

    if (value === '') {
      setFormErrors(prev => ({ ...prev, community: true }))
      return
    }

    setFormErrors(prev => ({ ...prev, community: false }))

    setCommunityForm(prev => {
      let newForm = { ...prev, [name]: numValue }

      if (name === 'memberSharePercentage' || name === 'managementSharePercentage') {
        const otherField = name === 'memberSharePercentage' ? 'managementSharePercentage' : 'memberSharePercentage'
        newForm[otherField] = Math.max(100 - numValue, 0)
      } else if (name === 'communityPercentage' || name === 'taskParticipantPercentage') {
        const otherField = name === 'communityPercentage' ? 'taskParticipantPercentage' : 'communityPercentage'
        newForm[otherField] = Math.max(100 - numValue, 0)
      }

      setIsCommunityChanged(JSON.stringify(newForm) !== JSON.stringify(communityForm))
      return newForm
    })
  }

  const handleAdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = value === '' ? 0 : parseFloat(value)

    if (value === '') {
      setFormErrors(prev => ({ ...prev, ad: true }))
      return
    }

    setFormErrors(prev => ({ ...prev, ad: false }))

    setAdForm(prev => {
      const newForm = { ...prev, [name]: numValue }
      const otherField = name === 'userPercentage' ? 'communityPercentage' : 'userPercentage'
      newForm[otherField] = Math.max(100 - numValue, 0)

      setIsAdChanged(JSON.stringify(newForm) !== JSON.stringify(adForm))
      return newForm
    })
  }

  const handleUpdateCommunity = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      try {
        const response = await updateCommunity(communityId, communityForm)
        if (response.success) {
          toast({
            title: "Success",
            description: "Community updated successfully.",
          })
          setIsCommunityChanged(false)
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to update community.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error updating community:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while updating the community.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateAd = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      try {
        const response = await updateAdvertisementDistribution(communityId, adForm)
        if (response.success) {
          toast({
            title: "Success",
            description: "Advertisement distribution updated successfully.",
          })
          setIsAdChanged(false)
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to update advertisement distribution.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error updating advertisement distribution:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while updating the advertisement distribution.",
          variant: "destructive",
        })
      }
    }
  }

  const handleBack = () => {
    router.push(`/admin/community/${id}`)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-4xl mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Community
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Community</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="maxParticipation">Max Participation</Label>
                  <Input
                    id="maxParticipation"
                    name="maxParticipation"
                    type="number"
                    value={communityForm.maxParticipation || ''}
                    onChange={handleCommunityChange}
                  />
                </div>
                <div>
                  <Label htmlFor="memberSharePercentage">Member Share Percentage</Label>
                  <Input
                    id="memberSharePercentage"
                    name="memberSharePercentage"
                    type="number"
                    step="0.01"
                    value={communityForm.memberSharePercentage || ''}
                    onChange={handleCommunityChange}
                  />
                </div>
                <div>
                  <Label htmlFor="managementSharePercentage">Management Share Percentage</Label>
                  <Input
                    id="managementSharePercentage"
                    name="managementSharePercentage"
                    type="number"
                    step="0.01"
                    value={communityForm.managementSharePercentage || ''}
                    onChange={handleCommunityChange}
                  />
                </div>
                <div>
                  <Label htmlFor="communityPercentage">Community Percentage</Label>
                  <Input
                    id="communityPercentage"
                    name="communityPercentage"
                    type="number"
                    step="0.01"
                    value={communityForm.communityPercentage || ''}
                    onChange={handleCommunityChange}
                  />
                </div>
                <div>
                  <Label htmlFor="taskParticipantPercentage">Task Participant Percentage</Label>
                  <Input
                    id="taskParticipantPercentage"
                    name="taskParticipantPercentage"
                    type="number"
                    step="0.01"
                    value={communityForm.taskParticipantPercentage || ''}
                    onChange={handleCommunityChange}
                  />
                </div>
                {formErrors.community && (
                  <p className="text-red-500 text-sm mt-2">Please fill in all community fields before modifying.</p>
                )}
                <Button 
                  type="button" 
                  onClick={handleUpdateCommunity} 
                  disabled={!isCommunityChanged || formErrors.community}
                >
                  Update Community
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edit Advertisement Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="userPercentage">User Percentage</Label>
                  <Input
                    id="userPercentage"
                    name="userPercentage"
                    type="number"
                    step="0.01"
                    value={adForm.userPercentage || ''}
                    onChange={handleAdChange}
                  />
                </div>
                <div>
                  <Label htmlFor="communityPercentage">Community Percentage</Label>
                  <Input
                    id="communityPercentage"
                    name="communityPercentage"
                    type="number"
                    step="0.01"
                    value={adForm.communityPercentage || ''}
                    onChange={handleAdChange}
                  />
                </div>
                {formErrors.ad && (
                  <p className="text-red-500 text-sm mt-2">Please fill in all advertisement fields before modifying.</p>
                )}
                <Button 
                  type="button" 
                  onClick={handleUpdateAd} 
                  disabled={!isAdChanged || formErrors.ad}
                >
                  Update Advertisement Distribution
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

