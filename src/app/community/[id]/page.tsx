"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, FileBarChart, Heart, Upload, ClipboardList, UserPlus, MoreVertical, X } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import CommunityBottomNav from "@/components/CommunityBottomNav"
import AnnouncementMarquee from "@/components/AnnouncementMarquee"
import MemberDetailsDialog from "@/components/MemberDetailsDialog"
import TwoColorProgressBar from "@/components/TwoColorProgressBar"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  getCommunityAnnouncements, 
  getCommunityMembers, 
  getCommunityWallet, 
  getCommunityTransactions,
  getCommunityQuestionnaireDetails,
} from '@/services/general-community-service/generalCommunityService'
import { joinCommunity, leaveCommunity, getCommunityDetails, CommunityDetails } from '@/services/userCommunityService'
import { getUserWallet, donateToCommunity } from '@/services/general-community-service/generalCommunityService'
import { checkEnterQuestionnaire } from '@/services/questionnaireService'
import Image from 'next/image'
import { getAllAdvertisements, Advertisement } from '@/services/adminAdvertisementService'

interface Announcement {
  announcementId: number;
  title: string;
  content: string;
  createdAt: string;
}

interface CommunityMember {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  effortPercentage: number;
  totalScore: number;
}

interface QuestionnaireDetails {
  airQualityScore: number;
  waterQualityScore: number;
  environmentalScore: number;
  participantsCount: number;
  totalCommunityMembers: number;
  participationRate: number;
  participationRateState: string;
}

const ScoreProgressBar: React.FC<{ label: string; score: number | undefined }> = ({ label, score }) => {
  const getColorClass = (score: number) => {
    if (score < 3) return "bg-red-500";
    if (score < 5) return "bg-orange-500";
    if (score < 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{score?.toFixed(1) ?? 'N/A'}/10</span>
      </div>
      <Progress
        value={score !== undefined ? (score / 10) * 100 : 0}
        className={`h-2 ${score !== undefined ? getColorClass(score) : 'bg-gray-300'}`}
      />
    </div>
  );
};

const ParticipationRate: React.FC<{ rate: number | undefined }> = ({ rate }) => {
  const getColorClass = (rate: number) => {
    if (rate < 33) return "text-red-500";
    if (rate < 66) return "text-blue-500";
    return "text-green-500";
  };

  const getLabel = (rate: number) => {
    if (rate < 33) return "LOW";
    if (rate < 66) return "MEDIUM";
    return "HIGH";
  };

  return (
    <div className={`font-bold ${rate !== undefined ? getColorClass(rate) : 'text-gray-500'}`}>
      {rate !== undefined ? getLabel(rate) : 'N/A'}
    </div>
  );
};

export default function CommunityDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState('community')
  const [isEntered, setIsEntered] = useState(false)
  const [communityData, setCommunityData] = useState<CommunityDetails | null>(null)
  const [questionnaireDetails, setQuestionnaireDetails] = useState<QuestionnaireDetails | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [isViewMode, setIsViewMode] = useState(true)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false)
  const [donationAmount, setDonationAmount] = useState('')
  const [userBalance, setUserBalance] = useState(0)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [ads, setAds] = useState<Advertisement[]>([])
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [showAdDetails, setShowAdDetails] = useState(false)
  const [showAdBanner, setShowAdBanner] = useState(false)

  useEffect(() => {
    const fetchCommunityData = async () => {
      if (typeof id === 'string') {
        const communityId = parseInt(id, 10)
        setIsLoading(true)
        try {
          const response = await getCommunityDetails(communityId)
          if (response.success && response.data) {
            setCommunityData(response.data)
            setIsViewMode(response.data.membershipStatus !== 'APPROVED')
            setIsEntered(response.data.membershipStatus === 'APPROVED')
          } else {
            toast({
              title: "Error",
              description: "Failed to fetch community data. Please try again.",
              variant: "destructive",
            })
          }

          const [announcementsResponse, membersResponse, questionnaireResponse] = await Promise.all([
            getCommunityAnnouncements(communityId),
            getCommunityMembers(communityId),
            getCommunityQuestionnaireDetails(communityId)
          ])

          if (announcementsResponse.success && announcementsResponse.data) {
            setAnnouncements(announcementsResponse.data)
          }

          if (membersResponse.success && membersResponse.data) {
            setMembers(membersResponse.data)
          }

          if (questionnaireResponse.success && questionnaireResponse.data) {
            setQuestionnaireDetails(questionnaireResponse.data)
          }
        } catch (error) {
          console.error('Error fetching community data:', error)
          toast({
            title: "Error",
            description: "Failed to fetch community data. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchCommunityData()
    // Fetch user role from localStorage
    const storedRole = localStorage.getItem('userRole')
    setUserRole(storedRole)
  }, [id, toast])

  const handleJoinCommunity = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      try {
        const response = await joinCommunity(communityId)
        if (response.success) {
          toast({
            title: "Success",
            description: response.message || "Join request sent successfully. Waiting for approval.",
          })
          // Update the community data
          if (communityData) {
            const updatedData = {
              ...communityData,
              membershipStatus: 'PENDING'
            }
            setCommunityData(updatedData)
          }
          setIsViewMode(true)
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to send join request.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error joining community:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while sending join request.",
          variant: "destructive",
        })
      }
    }
  }

  const handleLeaveCommunity = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      try {
        const response = await leaveCommunity(communityId)
        if (response.success) {
          toast({
            title: "Success",
            description: response.message || "Successfully left the community.",
          })
          router.push('/community')
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to leave the community.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error leaving community:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while leaving the community.",
          variant: "destructive",
        })
      }
    }
    setIsLeaveDialogOpen(false)
  }

  const handleViewCommunityWallet = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      try {
        const [walletResponse, transactionsResponse] = await Promise.all([
          getCommunityWallet(communityId),
          getCommunityTransactions(communityId)
        ])
        if (walletResponse.success && walletResponse.data && transactionsResponse.success && transactionsResponse.data) {
          router.push(`/community/${id}/wallet?status=${communityData?.membershipStatus}`)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch community wallet data.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching community wallet data:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching community wallet data.",
          variant: "destructive",
        })
      }
    }
  }

  const handleViewCommunityReport = () => {
    if (typeof id === 'string') {
      router.push(`/community/${id}/report?status=${communityData?.membershipStatus}`)
    }
  }

  const handleDonate = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      try {
        const response = await donateToCommunity(communityId, parseFloat(donationAmount))
        if (response.success) {
          toast({
            title: "Success",
            description: response.message || "Donation successful.",
          })
          setIsDonateDialogOpen(false)
          setDonationAmount('')
          // Refresh wallet balance after successful donation
          const walletInfo = await getUserWallet()
          if (walletInfo.success && walletInfo.data) {
            setUserBalance(walletInfo.data.balance)
          }
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to process donation.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error donating to community:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while processing the donation.",
          variant: "destructive",
        })
      }
    }
  }

  useEffect(() => {
    const fetchUserWallet = async () => {
      const walletInfo = await getUserWallet()
      if (walletInfo.success && walletInfo.data) {
        setUserBalance(walletInfo.data.balance)
      }
    }
    fetchUserWallet()
  }, [])

  const handleVoteNewAdmin = () => {
    if (typeof id === 'string') {
      router.push(`/community/${id}/vote-admin?status=${communityData?.membershipStatus}`);
    }
  };

  const handleAnswerQuestionnaire = async () => {
    if (typeof id === 'string') {
      try {
        const response = await checkEnterQuestionnaire(parseInt(id, 10))
        if (response.success && response.data) {
          router.push(`/community/${id}/questionnaire`)
        } else {
          toast({
            title: "Cannot Enter Questionnaire",
            description: "You have already completed today's questionnaire or it's not available yet.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error checking questionnaire entry:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  useEffect(() => {
    const fetchAds = async () => {
      if (typeof id === 'string') {
        const communityId = parseInt(id, 10)
        try {
          const response = await getAllAdvertisements(communityId)
          if (response.success && response.data) {
            setAds(response.data.filter(ad => ad.status === 'ON BOARD'))
          }
        } catch (error) {
          console.error('Error fetching advertisements:', error)
        }
      }
    }

    fetchAds()
  }, [id])

  useEffect(() => {
    if (ads.length > 1 && !showAdDetails) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length)
      }, 5000) // Change ad every 5 seconds

      return () => clearInterval(interval)
    }
  }, [ads, showAdDetails])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAdBanner(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const AdBanner = () => {
    if (ads.length === 0 || !showAdBanner) return null

    const currentAd = ads[currentAdIndex]

    return (
      <div className="fixed bottom-16 right-4 w-64 h-64 bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          className="absolute top-2 right-2 z-10"
          onClick={(e) => {
            e.stopPropagation()
            setShowAdBanner(false)
          }}
        >
          <X className="h-6 w-6" />
        </button>
        <div
          onClick={() => setShowAdDetails(true)}
          className="w-full h-full cursor-pointer"
        >
          <Image
            src={currentAd.mediaUrls[0]?.mediaUrl || '/placeholder.svg'}
            alt={currentAd.title}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </div>
    )
  }

  const AdDetailsPopup = () => {
    if (!showAdDetails) return null

    const currentAd = ads[currentAdIndex]

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <button
            className="absolute top-2 right-2"
            onClick={() => setShowAdDetails(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-bold mb-4">{currentAd.title}</h2>
          <p className="mb-4">{currentAd.description}</p>
          <Image
            src={currentAd.mediaUrls[0]?.mediaUrl || '/placeholder.svg'}
            alt={currentAd.title}
            width={300}
            height={200}
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      {announcements.length > 0 && <AnnouncementMarquee announcements={announcements} />}
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{communityData?.name || 'Loading...'}</h1>
          {!isViewMode && (
            <>
              {!userRole || userRole === 'admin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setIsLeaveDialogOpen(true)}>
                      Leave Community
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {userRole === 'member' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setIsLeaveDialogOpen(true)}>
                      Leave Community
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleVoteNewAdmin}>
                      Vote New Admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
        
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Community Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Total Members: {communityData?.totalMembers ?? 0}/{communityData?.maxParticipation ?? 0}</p>
            <p className="mb-4">Admin: {communityData?.adminName || 'N/A'}</p>
            {communityData?.totalMembers && communityData.totalMembers > 0 && <MemberDetailsDialog members={members} />}
            <div className="mt-4">
              <h3 className="font-bold mb-2">Reward Distribution</h3>
              <TwoColorProgressBar 
                value1={communityData?.rewardDistribution.communityPercentage ?? 0}
                value2={communityData?.rewardDistribution.taskParticipantPercentage ?? 0}
                label1="Community"
                label2="Task Participants"
              />
            </div>
            <div className="mt-4">
              <h3 className="font-bold mb-2">Advertisement Distribution</h3>
              <TwoColorProgressBar 
                value1={communityData?.advertisementDistribution.userPercentage ?? 0}
                value2={communityData?.advertisementDistribution.communityPercentage ?? 0}
                label1="User"
                label2="Community"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {(isViewMode || !isEntered) && (
            <>
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={handleViewCommunityWallet}
              >
                <Wallet className="h-5 w-5" />
                View Community Wallet
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={handleViewCommunityReport}
              >
                <FileBarChart className="h-5 w-5" />
                View Community Report
              </Button>
            </>
          )}
          {communityData?.membershipStatus === 'PENDING' && (
            <p className="text-yellow-600 font-semibold col-span-full">Your join request is pending approval.</p>
          )}
          {isViewMode && communityData?.membershipStatus === 'NOT_MEMBER' && (
            <Button 
              className="flex items-center justify-center gap-2 col-span-full"
              onClick={handleJoinCommunity}
            >
              <UserPlus className="h-5 w-5" />
              Join Community
            </Button>
          )}
        </div>

        {!isViewMode && isEntered && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center p-4 h-auto"
                    onClick={handleViewCommunityWallet}
                  >
                    <Wallet className="h-6 w-6 mb-2" />
                    <span className="text-xs text-center">View Wallet</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center p-4 h-auto"
                    onClick={handleViewCommunityReport}
                  >
                    <FileBarChart className="h-6 w-6 mb-2" />
                    <span className="text-xs text-center">View Report</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center p-4 h-auto bg-yellow-100 hover:bg-yellow-200"
                    onClick={() => setIsDonateDialogOpen(true)}
                  >
                    <Heart className="h-6 w-6 mb-2" />
                    <span className="text-xs text-center">Donate</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Daily Questionnaire Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading questionnaire details...</p>
            ) : communityData?.questionnaireScores ? (
              <div className="space-y-4">
                <ScoreProgressBar label="Air Quality" score={communityData.questionnaireScores.airQualityScore} />
                <ScoreProgressBar label="Water Quality" score={communityData.questionnaireScores.waterQualityScore} />
                <ScoreProgressBar label="Environmental" score={communityData.questionnaireScores.environmentalScore} />
                <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Participation Rate:</span>
                    <ParticipationRate rate={communityData.totalMembers > 0 ? (communityData.questionnaireScores.participantsCount / communityData.totalMembers) * 100 : undefined} />
                  </div>
                  <Progress
                    value={communityData.totalMembers > 0 ? (communityData.questionnaireScores.participantsCount / communityData.totalMembers) * 100 : 0}
                    className="h-2 bg-blue-200"
                  />
                  <div className="mt-2 text-sm text-gray-600 flex justify-between">
                    <span>{communityData.questionnaireScores.participantsCount} participants</span>
                    <span>{communityData.totalMembers} total members</span>
                  </div>
                </div>
                {isEntered && (
                  <div className="mt-4">
                    <Button onClick={handleAnswerQuestionnaire} className="w-full">
                      Answer Questionnaire
                    </Button>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Earn 10 points by answering today's questionnaire!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p>No questionnaire data available.</p>
            )}
          </CardContent>
        </Card>

      </div>
      
      <CommunityBottomNav 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        isEntered={isEntered}
        isMember={communityData?.membershipStatus === 'APPROVED'}
      />

      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to leave this community?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will need to rejoin the community if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveCommunity}>Leave Community</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDonateDialogOpen} onOpenChange={setIsDonateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Donate to Community</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the amount you want to donate. Your current balance is ${userBalance.toFixed(2)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              placeholder="Enter donation amount"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDonate} disabled={parseFloat(donationAmount) <= 0 || parseFloat(donationAmount) > userBalance}>
              Donate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AdBanner />
      <AdDetailsPopup />
    </div>
  )
}

