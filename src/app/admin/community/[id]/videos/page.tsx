"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, X } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { getPendingVideos, approveVideo, rejectVideo, AdminVideo, VIDEO_CATEGORIES, VideoCategory } from '@/services/adminVideoService'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const StatusTag = ({ type, value }: { type: string; value: string }) => {
  let color = 'bg-gray-200 text-gray-800';
  if (type === 'videoType') {
    color = value === 'LOCAL' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800';
  } else if (type === 'category') {
    color = 'bg-purple-200 text-purple-800';
  }
  return (
    <span className={`inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      {value}
    </span>
  );
};

const VideoCard = ({ video, onViewDetails }: { video: AdminVideo; onViewDetails: () => void }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="relative w-full h-40 mb-4">
          <Image
            src={video.videoImageUrl}
            alt={video.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <h3 className="text-xl font-bold mb-4">{video.title}</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusTag type="videoType" value={video.type} />
            <StatusTag type="category" value={video.category} />
          </div>
          <Button 
            onClick={onViewDetails}
            className="w-full mt-4"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdminCommunityVideosPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [pendingVideos, setPendingVideos] = useState<AdminVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<AdminVideo | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const fetchPendingVideos = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      setIsLoading(true)
      try {
        const response = await getPendingVideos(communityId)
        if (response.success && response.data) {
          setPendingVideos(response.data)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch pending videos.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching pending videos:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching pending videos.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchPendingVideos()
  }, [id, toast])

  const handleBack = () => {
    router.push(`/admin/community/${id}`)
  }

  const handleApproveVideo = async (videoId: number) => {
    try {
      const response = await approveVideo(videoId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Video approved successfully.",
        })
        setIsDetailsDialogOpen(false)
        fetchPendingVideos()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to approve video.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error approving video:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while approving the video.",
        variant: "destructive",
      })
    }
  }

  const handleRejectVideo = async (videoId: number) => {
    try {
      const response = await rejectVideo(videoId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Video rejected successfully.",
        })
        setIsDetailsDialogOpen(false)
        fetchPendingVideos()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to reject video.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error rejecting video:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while rejecting the video.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-7xl mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Community
        </button>

        <h1 className="text-2xl font-bold mb-6">Pending Community Videos</h1>

        {isLoading ? (
          <p>Loading pending videos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingVideos.map((video) => (
              <VideoCard
                key={video.videoId}
                video={video}
                onViewDetails={() => {
                  setSelectedVideo(video)
                  setIsDetailsDialogOpen(true)
                }}
              />
            ))}
          </div>
        )}
        
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[400px] max-h-[70vh] overflow-y-auto">
            <DialogHeader className="flex flex-row items-center justify-between border-b pb-2">
              <DialogTitle className="text-lg font-semibold">
                {selectedVideo?.title}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 p-0"
                onClick={() => setIsDetailsDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="relative w-full h-32">
                <Image
                  src={
                    selectedVideo?.videoImageUrl
                      ? typeof selectedVideo.videoImageUrl === 'string'
                        ? selectedVideo.videoImageUrl
                        : (selectedVideo.videoImageUrl as { videoImageUrl: string }).videoImageUrl
                      : '/placeholder.svg'
                  }
                  alt={selectedVideo?.title || 'Video thumbnail'}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">{selectedVideo?.description}</p>
                <div className="flex flex-wrap gap-2">
                  <div className="w-full">
                    <span className="text-sm font-medium">Category:</span>{' '}
                    <StatusTag type="category" value={selectedVideo?.category || ''} />
                  </div>
                  <div className="w-full">
                    <span className="text-sm font-medium">Type:</span>{' '}
                    <StatusTag type="videoType" value={selectedVideo?.type || ''} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-medium">Fee:</span> ${selectedVideo?.fee.toFixed(2)}</p>
                  <p><span className="font-medium">Views:</span> {selectedVideo?.view}</p>
                  <p><span className="font-medium">Status:</span> {selectedVideo?.status}</p>
                  <p><span className="font-medium">Uploaded:</span> {selectedVideo?.uploadedAt ? new Date(selectedVideo.uploadedAt).toLocaleDateString() : ''}</p>
                </div>
                {selectedVideo?.mediaUrls[0] && (
                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-1">Video Link:</h4>
                    <a 
                      href={selectedVideo.mediaUrls[0].mediaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-500 hover:underline break-all"
                    >
                      {selectedVideo.title}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="border-t pt-4">
              <div className="flex gap-2 w-full">
                <Button 
                  onClick={() => handleRejectVideo(selectedVideo?.videoId || 0)} 
                  variant="destructive"
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => handleApproveVideo(selectedVideo?.videoId || 0)}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

