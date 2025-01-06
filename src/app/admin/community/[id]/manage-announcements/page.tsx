"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { getCommunityAnnouncements } from '@/services/general-community-service/generalCommunityService'
import { createAnnouncement, deleteAnnouncement } from '@/services/adminCommunityService'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Announcement {
  announcementId: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function ManageAnnouncementsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('')
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<number | null>(null)

  useEffect(() => {
    fetchAnnouncements()
  }, [id])

  const fetchAnnouncements = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      try {
        const response = await getCommunityAnnouncements(communityId)
        if (response.success && response.data) {
          setAnnouncements(response.data)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch announcements.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching announcements:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching announcements.",
          variant: "destructive",
        })
      }
    }
  }

  const handleBack = () => {
    router.push(`/admin/community/${id}`)
  }

  const handleCreateAnnouncement = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      
      // Validation
      if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) {
        toast({
          title: "Error",
          description: "Title and content cannot be empty.",
          variant: "destructive",
        })
        return
      }
      
      try {
        const response = await createAnnouncement(communityId, newAnnouncementTitle, newAnnouncementContent)
        if (response.success) {
          toast({
            title: "Success",
            description: "Announcement created successfully.",
          })
          setIsCreateDialogOpen(false)
          setNewAnnouncementTitle('')
          setNewAnnouncementContent('')
          fetchAnnouncements()
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to create announcement.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error creating announcement:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while creating the announcement.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteAnnouncement = async (announcementId: number) => {
    try {
      const response = await deleteAnnouncement(announcementId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Announcement deleted successfully.",
        })
        fetchAnnouncements()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete announcement.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the announcement.",
        variant: "destructive",
      })
    }
    setDeleteAnnouncementId(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-4xl mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Community
        </button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Manage Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="mb-4"
            >
              Create New Announcement
            </Button>
            {announcements.map((announcement) => (
              <div key={announcement.announcementId} className="mb-4 p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{announcement.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(announcement.createdAt).toLocaleString()}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteAnnouncementId(announcement.announcementId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2">{announcement.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Announcement</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Announcement Title"
              value={newAnnouncementTitle}
              onChange={(e) => setNewAnnouncementTitle(e.target.value)}
            />
            <Textarea
              placeholder="Announcement Content"
              value={newAnnouncementContent}
              onChange={(e) => setNewAnnouncementContent(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateAnnouncement}>Create</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteAnnouncementId !== null} onOpenChange={() => setDeleteAnnouncementId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteAnnouncementId && handleDeleteAnnouncement(deleteAnnouncementId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

