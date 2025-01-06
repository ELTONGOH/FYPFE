"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, FileBarChart, Heart, Upload, ClipboardList, LogIn, UserPlus, MoreVertical, Users, MessageSquare, Edit } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  getCommunityAnnouncements, 
  getCommunityMembers, 
  getCommunityWallet, 
  getCommunityTransactions,
  getCommunityQuestionnaireDetails,
  donateToCommunity
} from '@/services/general-community-service/generalCommunityService'
import { getUserWallet } from '@/services/general-community-service/generalCommunityService'
import { getVotePercentage } from '@/services/voteAdminService'
import { getAdminCommunities, AdminCommunity } from '@/services/adminCommunityService'
import { getPendingMembers } from '@/services/adminCommunityService';
import { getAllAdvertisements, Advertisement } from '@/services/adminAdvertisementService'
import CommunityBottomNav from "@/components/CommunityBottomNav"
import AnnouncementMarquee from "@/components/AnnouncementMarquee"
import MemberDetailsDialog from "@/components/MemberDetailsDialog"
import TwoColorProgressBar from "@/components/TwoColorProgressBar"
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


interface CommunityData {
  name: string;
  membershipStatus: string;
  maxParticipation: number;
  adminName: string;
  rewardDistribution: {
    communityPercentage: number;
    taskParticipantPercentage: number;
  };
  advertisementDistribution: {
    userPercentage: number;
    communityPercentage: number;
  };
}

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

const ScoreProgressBar: React.FC<{ label: string; score: number }> = ({ label, score }) => {
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
        <span className="text-sm font-medium">{score.toFixed(1)}/10</span>
      </div>
      <Progress
        value={(score / 10) * 100}
        className={`h-2 ${getColorClass(score)}`}
      />
    </div>
  );
};

const ParticipationRate: React.FC<{ rate: number }> = ({ rate }) => {
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
    <div className={`font-bold ${getColorClass(rate)}`}>
      {getLabel(rate)}
    </div>
  );
};

export default function AdminCommunityDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState('community')
  const [communityData, setCommunityData] = useState<AdminCommunity | null>(null)
  const [questionnaireDetails, setQuestionnaireDetails] = useState<QuestionnaireDetails | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false)
  const [donationAmount, setDonationAmount] = useState('')
  const [userBalance, setUserBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [votePercentage, setVotePercentage] = useState<number | null>(null)
  const [isVoteDetailsOpen, setIsVoteDetailsOpen] = useState(false)
  const [pendingMembersCount, setPendingMembersCount] = useState<number>(0);
  const [pendingAdvertisementsCount, setPendingAdvertisementsCount] = useState<number>(0);

  useEffect(() => {
    const fetchCommunityData = async () => {
      if (typeof id === 'string') {
        const communityId = parseInt(id, 10)
        setIsLoading(true)
        try {
          // Use query parameters if available, otherwise fetch from API
          const params = new URLSearchParams(window.location.search);
          if (params.get('name')) {
            setCommunityData({
              communityId,
              name: params.get('name') || '',
              maxParticipation: parseInt(params.get('maxParticipation') || '0', 10),
              adminName: params.get('adminName') || '',
              memberSharePercentage: parseFloat(params.get('memberSharePercentage') || '0'),
              managementSharePercentage: parseFloat(params.get('managementSharePercentage') || '0'),
              rewardDistribution: {
                communityPercentage: parseFloat(params.get('rewardCommunityPercentage') || '0'),
                taskParticipantPercentage: parseFloat(params.get('rewardTaskParticipantPercentage') || '0'),
              },
              advertisementDistribution: {
                userPercentage: parseFloat(params.get('adUserPercentage') || '0'),
                communityPercentage: parseFloat(params.get('adCommunityPercentage') || '0'),
              },
            } as AdminCommunity);
          } else {
            // Fetch community data if not available in query params
            const communitiesResponse = await getAdminCommunities()
            if (communitiesResponse.success && communitiesResponse.data) {
              const community = communitiesResponse.data.find(c => c.communityId === communityId)
              if (community) {
                setCommunityData(community)
              } else {
                throw new Error("Community not found")
              }
            } else {
              throw new Error("Failed to fetch community data")
            }
          }

          const [announcementsResponse, membersResponse, questionnaireResponse, voteResponse, pendingMembersResponse, advertisementsResponse] = await Promise.all([
            getCommunityAnnouncements(communityId),
            getCommunityMembers(communityId),
            getCommunityQuestionnaireDetails(communityId),
            getVotePercentage(id),
            getPendingMembers(communityId),
            getAllAdvertisements(communityId)
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

          if (voteResponse.success && voteResponse.data) {
            setVotePercentage(voteResponse.data.percentage)
          }

          if (pendingMembersResponse.success && pendingMembersResponse.data) {
            setPendingMembersCount(pendingMembersResponse.data.length);
          }

          if (advertisementsResponse.success && advertisementsResponse.data) {
            const pendingAds = advertisementsResponse.data.filter(ad => ad.status === 'PENDING');
            setPendingAdvertisementsCount(pendingAds.length);
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
  }, [id, toast])

  const handleViewCommunityWallet = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      try {
        const [walletResponse, transactionsResponse] = await Promise.all([
          getCommunityWallet(communityId),
          getCommunityTransactions(communityId)
        ])
        if (walletResponse.success && walletResponse.data && transactionsResponse.success && transactionsResponse.data) {
          router.push(`/admin/community/${id}/wallet`)
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
      router.push(`/admin/community/${id}/report`)
    }
  }

  const handleCreateNewAnnouncement = () => {
    if (typeof id === 'string') {
      router.push(`/admin/community/${id}/create-announcement`)
    }
  }

  const handleViewPendingMembers = () => {
    if (typeof id === 'string') {
      router.push(`/admin/community/${id}/pending-members`)
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
            description: response.data || "Failed to process donation.",
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

  useEffect(() => {
    const fetchVotePercentage = async () => {
      if (typeof id === 'string') {
        try {
          const response = await getVotePercentage(id)
          if (response.success && response.data) {
            setVotePercentage(response.data.percentage)
          }
        } catch (error) {
          console.error('Error fetching vote percentage:', error)
        }
      }
    }

    fetchVotePercentage()
  }, [id])

  const handleManageAnnouncements = () => {
    if (typeof id === 'string') {
      router.push(`/admin/community/${id}/manage-announcements`)
    }
  }

  const handleManageAdvertisements = () => {
    if (typeof id === 'string') {
      router.push(`/admin/community/${id}/manage-advertisements`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      {announcements.length > 0 && <AnnouncementMarquee announcements={announcements} />}
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold mr-2">{communityData?.name || 'Loading...'}</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsVoteDetailsOpen(true)}>
                  View Vote Percentage
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push(`/admin/community/${id}/update`)}>
                  Update Community
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Community Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Total Members: {members.length}/{communityData?.maxParticipation || 0}</p>
            <p className="mb-4">Admin: {communityData?.adminName || 'N/A'}</p>
            {members.length > 0 && <MemberDetailsDialog members={members} />}
            <div className="mt-4">
              <h3 className="font-bold mb-2">Reward Distribution</h3>
              <TwoColorProgressBar 
                value1={communityData?.rewardDistribution.communityPercentage || 0}
                value2={communityData?.rewardDistribution.taskParticipantPercentage || 0}
                label1="Community"
                label2="Task Participants"
              />
            </div>
            <div className="mt-4">
              <h3 className="font-bold mb-2">Advertisement Distribution</h3>
              <TwoColorProgressBar 
                value1={communityData?.advertisementDistribution.userPercentage || 0}
                value2={communityData?.advertisementDistribution.communityPercentage || 0}
                label1="User"
                label2="Community"
              />
            </div>
          </CardContent>
        </Card>

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

          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 h-full"
            onClick={handleManageAnnouncements}
          >
            <MessageSquare className="h-5 w-5" />
            Manage Announcements
          </Button>

          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 h-full relative"
            onClick={handleViewPendingMembers}
          >
            <Users className="h-5 w-5" />
            View Pending Members
            {pendingMembersCount > 0 && (
              <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingMembersCount}
              </span>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 h-full relative"
            onClick={handleManageAdvertisements}
          >
            <Upload className="h-5 w-5" />
            Manage Advertisements
            {pendingAdvertisementsCount > 0 && (
              <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingAdvertisementsCount}
              </span>
            )}
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Daily Questionnaire Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading questionnaire details...</p>
            ) : questionnaireDetails ? (
              <div className="space-y-4">
                <ScoreProgressBar label="Air Quality" score={questionnaireDetails.airQualityScore} />
                <ScoreProgressBar label="Water Quality" score={questionnaireDetails.waterQualityScore} />
                <ScoreProgressBar label="Environmental" score={questionnaireDetails.environmentalScore} />
                <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Participation Rate:</span>
                    <ParticipationRate rate={questionnaireDetails.participationRate} />
                  </div>
                  <Progress
                    value={questionnaireDetails.participationRate}
                    className="h-2 bg-blue-200"
                  />
                  <div className="mt-2 text-sm text-gray-600 flex justify-between">
                    <span>{questionnaireDetails.participantsCount} participants</span>
                    <span>{questionnaireDetails.totalCommunityMembers} total members</span>
                  </div>
                </div>
              </div>
            ) : (
              <p>No questionnaire data available.</p>
            )}
          </CardContent>
        </Card>

      </div>
      

      <AlertDialog open={isVoteDetailsOpen} onOpenChange={setIsVoteDetailsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Admin Vote Percentage</AlertDialogTitle>
            <AlertDialogDescription>
              Current vote percentage for new admin: {votePercentage !== null && votePercentage !== undefined ? `${votePercentage.toFixed(2)}%` : '0%'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsVoteDetailsOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <CommunityBottomNav 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        isEntered={true}
        isMember={true}
      />

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
    </div>
  )
}

