"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, X, User, Mail } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { getPendingMembers, approveMember, rejectMember, PendingMember } from '@/services/adminCommunityService'

export default function PendingMembersPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPendingMembers()
  }, [id])

  const fetchPendingMembers = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      setIsLoading(true)
      try {
        const response = await getPendingMembers(communityId)
        if (response.success && response.data) {
          setPendingMembers(response.data)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch pending members.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching pending members:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching pending members.",
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

  const handleApprove = async (userId: number) => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      try {
        // Optimistically remove the member from the list
        setPendingMembers(prevMembers => prevMembers.filter(member => member.userId !== userId))

        const response = await approveMember(communityId, userId)
        if (response.success) {
          toast({
            title: "Success",
            description: "Member approved successfully.",
          })
        } else {
          // If the API call fails, add the member back to the list
          await fetchPendingMembers()
          toast({
            title: "Error",
            description: response.message || "Failed to approve member.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error approving member:', error)
        // If there's an error, refresh the list to ensure accuracy
        await fetchPendingMembers()
        toast({
          title: "Error",
          description: "An unexpected error occurred while approving the member.",
          variant: "destructive",
        })
      }
    }
  }

  const handleReject = async (userId: number) => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      try {
        // Optimistically remove the member from the list
        setPendingMembers(prevMembers => prevMembers.filter(member => member.userId !== userId))

        const response = await rejectMember(communityId, userId)
        if (response.success) {
          toast({
            title: "Success",
            description: "Member rejected successfully.",
          })
        } else {
          // If the API call fails, add the member back to the list
          await fetchPendingMembers()
          toast({
            title: "Error",
            description: response.message || "Failed to reject member.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error rejecting member:', error)
        // If there's an error, refresh the list to ensure accuracy
        await fetchPendingMembers()
        toast({
          title: "Error",
          description: "An unexpected error occurred while rejecting the member.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-4xl mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Community
        </button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Pending Members</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading pending members...</p>
            ) : pendingMembers.length > 0 ? (
              <div className="space-y-6">
                {pendingMembers.map((member) => (
                  <Card key={member.userId} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center">
                            <User className="mr-2 h-5 w-5" /> {member.fullName}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail className="mr-2 h-4 w-4" /> {member.email}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Username: {member.username}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleApprove(member.userId)}
                          >
                            <Check className="mr-2 h-4 w-4" /> Approve
                          </Button>
                          <Button
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleReject(member.userId)}
                          >
                            <X className="mr-2 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No pending members found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

