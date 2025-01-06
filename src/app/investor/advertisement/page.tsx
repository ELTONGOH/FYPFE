"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getAllCommunities, Community } from '@/services/userCommunityService'
import BottomNav from "@/components/BottomNav"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreateAdForm } from '@/components/CreateAdForm'
import { Progress } from "@/components/ui/progress"
import { getUserWallet } from '@/services/general-community-service/generalCommunityService'

type QuestionnaireScores = {
  waterQualityScore: number | null;
  airQualityScore: number | null;
  environmentalScore: number | null;
};

export default function InvestorAdvertisementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [communities, setCommunities] = useState<Community[]>([])
  const [selectedCommunities, setSelectedCommunities] = useState<number[]>([])
  const [currentSection, setCurrentSection] = useState("investor")
  const [isCreateAdOpen, setIsCreateAdOpen] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [showAcknowledgment, setShowAcknowledgment] = useState(false)

  useEffect(() => {
    fetchCommunities()
    fetchUserWallet()
  }, [])

  const fetchCommunities = async () => {
    try {
      const response = await getAllCommunities()
      if (response.success && response.data) {
        setCommunities(response.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch communities.",
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
    }
  }

  const fetchUserWallet = async () => {
    try {
      const response = await getUserWallet()
      if (response.success && response.data) {
        setUserBalance(response.data.balance)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch wallet balance.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching wallet balance.",
        variant: "destructive",
      })
    }
  }

  const handleCommunitySelect = (communityId: number) => {
    setSelectedCommunities(prev => 
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    )
  }

  const getSelectedCommunities = () => {
    return communities.filter(community => selectedCommunities.includes(community.communityId))
  }

  const calculateBasicFee = (totalMembers: number) => {
    return totalMembers * 0.1 // Base fee per day
  }

  const renderCompactScores = (scores: QuestionnaireScores | undefined) => {
    if (!scores) return null;
    return (
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-gray-600 mb-1">Water</div>
          <Progress value={(scores.waterQualityScore || 0) * 10} className="h-1" />
          <div className="mt-1 font-medium">{scores.waterQualityScore?.toFixed(1) ?? 'N/A'}</div>
        </div>
        <div>
          <div className="text-gray-600 mb-1">Air</div>
          <Progress value={(scores.airQualityScore || 0) * 10} className="h-1" />
          <div className="mt-1 font-medium">{scores.airQualityScore?.toFixed(1) ?? 'N/A'}</div>
        </div>
        <div>
          <div className="text-gray-600 mb-1">Env</div>
          <Progress value={(scores.environmentalScore || 0) * 10} className="h-1" />
          <div className="mt-1 font-medium">{scores.environmentalScore?.toFixed(1) ?? 'N/A'}</div>
        </div>
      </div>
    )
  }

  const handleDialogClose = () => {
    setIsCreateAdOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Create Advertisement</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selected Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {getSelectedCommunities().map((community) => (
                <div key={community.communityId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                  {community.name}
                </div>
              ))}
            </div>
            <div className="mb-4">
              <span>Your Wallet Balance: ${userBalance.toFixed(2)}</span>
            </div>
            <Dialog open={isCreateAdOpen || showAcknowledgment} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full" 
                  disabled={selectedCommunities.length === 0}
                  onClick={() => setShowAcknowledgment(true)}
                >
                  Create Advertisement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Advertisement</DialogTitle>
                </DialogHeader>
                {showAcknowledgment ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Before creating an advertisement, please acknowledge the following:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
                      <li>Your advertisement will be reviewed before being published</li>
                      <li>The fee is refundable  once the advertisement is approved ,you able to downrack your Ad , fee will charged based on the upload duration</li>
                      <li>You agree to comply with our community guidelines</li>
                      <li>Basic fee calculation: Number of community members * 0.1 * Number of days</li>
                    </ul>
                    <Button onClick={() => {
                      setShowAcknowledgment(false)
                      setIsCreateAdOpen(true)
                    }}>I Understand</Button>
                  </>
                ) : (
                  <CreateAdForm 
                    selectedCommunities={getSelectedCommunities().map(community => ({
                      id: community.communityId,
                      name: community.name,
                      minFee: calculateBasicFee(community.totalMembers),
                      totalMember : community.totalMembers
                    }))}
                    onSuccess={() => {
                      setIsCreateAdOpen(false)
                      setSelectedCommunities([])
                      setIsCreateAdOpen(false)
                    }}
                    userBalance={userBalance}
                  />
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[calc(100vh-400px)] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {communities.map((community) => (
                  <Card 
                    key={community.communityId}
                    className={`cursor-pointer transition-all border ${
                      selectedCommunities.includes(community.communityId) 
                        ? 'ring-2 ring-blue-500 ring-inset shadow-lg bg-blue-50' 
                        : 'hover:shadow-md hover:bg-gray-50'
                    }`}
                    onClick={() => handleCommunitySelect(community.communityId)}
                  >
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-2">{community.name}</h3>
                      {renderCompactScores(community.questionnaireScores)}
                      <div className="text-xs text-gray-600 mt-2">
                        Members: {community.totalMembers}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav setCurrentPage={setCurrentSection} currentPage={currentSection} />
    </div>
  )
}

