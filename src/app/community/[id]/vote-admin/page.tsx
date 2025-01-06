"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { getVotePercentage, voteForNewAdmin } from '@/services/voteAdminService'
import { getCommunityMembers, CommunityMember } from '@/services/general-community-service/generalCommunityService'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel
} from "@/components/ui/alert-dialog"

export default function VoteAdminPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [votePercentage, setVotePercentage] = useState<number | null>(null)
  const [totalMembers, setTotalMembers] = useState<number>(0)
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (typeof id === 'string') {
        try {
          const [percentageResponse, membersResponse] = await Promise.all([
            getVotePercentage(id),
            getCommunityMembers(parseInt(id, 10))
          ]);

          if (percentageResponse.success && percentageResponse.data) {
            setVotePercentage(percentageResponse.data.percentage || 0);
            setTotalMembers(percentageResponse.data.totalMembers);
          }

          if (membersResponse.success && membersResponse.data) {
            const sortedMembers = membersResponse.data.sort((a, b) => b.effortPercentage - a.effortPercentage);
            setMembers(sortedMembers);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          toast({
            title: "Error",
            description: "Failed to fetch vote data. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    fetchData();
  }, [id, toast]);

  const handleBack = () => {
    router.push(`/community/${id}?status=MEMBER`);
  };

  const handleVote = () => {
    if (!selectedCandidate) {
      toast({
        title: "Error",
        description: "Please select a candidate before voting.",
        variant: "destructive",
      });
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmedVote = async () => {
    setIsVoting(true);
    try {
      const response = await voteForNewAdmin(id as string, selectedCandidate as string);
      if (response.success) {
        setShowConfirmation(true);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit your vote. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error voting for new admin:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
      setIsConfirmDialogOpen(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    router.push(`/community/${id}?status=MEMBER`);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-4xl mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Community
        </button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Vote for New Admin</CardTitle>
          </CardHeader>
          <CardContent>
            {totalMembers < 0 ? (
              <p className="text-red-500 mb-4">
                Voting is not available. The community needs at least 20 members to start voting for a new admin.
              </p>
            ) : (
              <>
                <p className="mb-4">Current vote percentage: {votePercentage !== null ? `${votePercentage.toFixed(2)}%` : 'Loading...'}</p>
                <p className="mb-4">
                  Select a candidate to vote for as the new community admin. If over 51% of the community votes, 
                  the admin role will be assigned to the candidate with the highest number of votes.
                </p>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between">
                      <div>
                        <input
                          type="radio"
                          id={member.userId.toString()}
                          name="adminCandidate"
                          value={member.userId.toString()}
                          checked={selectedCandidate === member.userId.toString()}
                          onChange={() => setSelectedCandidate(member.userId.toString())}
                          className="mr-2"
                        />
                        <label htmlFor={member.userId.toString()}>{member.fullName}</label>
                      </div>
                      <span>Effort: {member.effortPercentage}%</span>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleVote} 
                  className="mt-4 w-full" 
                  disabled={isVoting || !selectedCandidate}
                >
                  {isVoting ? 'Submitting Vote...' : 'Submit Vote'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to vote for this candidate? 
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedVote}>Confirm Vote</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vote Submitted Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              Your vote for the new admin has been recorded. Thank you for participating in the community governance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirmationClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
