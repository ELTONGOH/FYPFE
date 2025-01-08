"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, X } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { getEducationalVideos, getOwnVideos, viewVideo, Video, VIDEO_CATEGORIES, UploadVideoData, VideoCategory, downrackVideo, uploadEducationalVideo } from '@/services/userVideoService'
import { getWalletInfo } from '@/services/home/walletService'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateVideoDialog } from '@/components/create-video-dialog'
import { Input } from "@/components/ui/input"

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

const VideoCard = ({ video, onViewDetails }: { video: Video; onViewDetails: () => void }) => {
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
          <p className="text-sm text-gray-600">Fee: ${video.fee.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Views: {video.view}</p>
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

export default function CommunityVideosPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [uploadedVideos, setUploadedVideos] = useState<Video[]>([])
  const [ownVideos, setOwnVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory | 'All'>('All')
  const [isViewConfirmationOpen, setIsViewConfirmationOpen] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isCreateVideoDialogOpen, setIsCreateVideoDialogOpen] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [searchQuery, setSearchQuery] = useState('')
  const videoLinkRef = useRef<HTMLAnchorElement>(null);

  const fetchVideos = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      setIsLoading(true)
      try {
        const [uploadedResponse, ownResponse] = await Promise.all([
          getEducationalVideos(communityId),
          getOwnVideos(communityId)
        ])
        if (uploadedResponse.success && uploadedResponse.data) {
          setUploadedVideos(uploadedResponse.data.filter(video => video.status === 'ON BOARD').sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()))
        }
        if (ownResponse.success && ownResponse.data) {
          setOwnVideos(ownResponse.data)
        }
      } catch (error) {
        console.error('Error fetching videos:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching videos.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [id, toast])

  const handleBack = () => {
    router.push(`/community/${id}`)
  }

  const handleViewVideo = async () => {
    if (!selectedVideo) return

    try {
      const walletResponse = await getWalletInfo()
      if (walletResponse.success && walletResponse.data) {
        setUserBalance(walletResponse.data.balance)
        setUserPoints(walletResponse.data.points)
      }

      setIsViewConfirmationOpen(true)
    } catch (error) {
      console.error('Error fetching user wallet:', error)
      toast({
        title: "Error",
        description: "Unable to fetch wallet balance. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleConfirmViewVideo = async () => {
    if (!selectedVideo) return

    try {
      const response = await viewVideo(selectedVideo.videoId)
      if (response.success && response.data) {
        setVideoUrl(response.data)
        setIsViewConfirmationOpen(false)
        toast({
          title: "Success",
          description: "Video purchased successfully. Please save the link to watch later.",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to purchase video.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error viewing video:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while trying to view the video.",
        variant: "destructive",
      })
    }
  }

  const handleCreateVideo = async (videoData: UploadVideoData) => {
    try {
      if (typeof id !== 'string') {
        throw new Error('Invalid community ID');
      }
      const communityId = parseInt(id, 10);
      if (isNaN(communityId)) {
        throw new Error('Invalid community ID');
      }
      
      const response = await uploadEducationalVideo({
        ...videoData,
        communityId: communityId
      });
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Video created successfully and is pending approval.",
        });
        fetchVideos(); // Refresh the video list
        setIsCreateVideoDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create video.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating video:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while trying to create the video.",
        variant: "destructive",
      });
    }
  };

  const filteredUploadedVideos = selectedCategory === 'All' 
    ? uploadedVideos 
    : uploadedVideos.filter(video => video.category === selectedCategory)

  const filteredOwnVideos = selectedCategory === 'All'
    ? ownVideos
    : ownVideos.filter(video => video.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-7xl mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Community
        </button>

        <h1 className="text-2xl font-bold mb-6">Community Videos</h1>

        <div className="sticky top-0 bg-gray-100 z-10 pb-4">
          <div className="mb-4 flex items-center gap-4">
            <Input 
              placeholder="Search videos..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full md:w-64"
            />
            <Select onValueChange={(value) => setSelectedCategory(value as VideoCategory | 'All')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {VIDEO_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    <StatusTag type="category" value={category} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="uploaded" className="w-full">
            <TabsList>
              <TabsTrigger value="uploaded">Uploaded Videos</TabsTrigger>
              <TabsTrigger value="own">Own Videos</TabsTrigger>
            </TabsList>
            <TabsContent value="uploaded">
              {isLoading ? (
                <p>Loading uploaded videos...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUploadedVideos.map((video) => (
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
            </TabsContent>
            <TabsContent value="own">
              {isLoading ? (
                <p>Loading own videos...</p>
              ) : (
                <>
                  <Button onClick={() => setIsCreateVideoDialogOpen(true)} className="mb-4">
                    Create Video
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOwnVideos.map((video) => (
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
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
        

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
                  src={selectedVideo?.videoImageUrl || '/placeholder.svg'}
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
              </div>
            </div>
            <DialogFooter className="border-t pt-4">
              <Button onClick={handleViewVideo} className="w-full">
                View Video
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isViewConfirmationOpen} onOpenChange={setIsViewConfirmationOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirm Video Purchase</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to purchase this video?</p>
              <p className="font-semibold mt-2">Fee: ${selectedVideo?.fee.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Your current balance: ${userBalance.toFixed(2)}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewConfirmationOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmViewVideo}>Confirm Purchase</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {videoUrl && (
          <Dialog open={!!videoUrl} onOpenChange={() => setVideoUrl(null)}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Video Link</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>Please save the following link to watch the video later:</p>
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all" ref={videoLinkRef}>
                  {videoUrl}
                </a>
              </div>
              <DialogFooter>
                <Button onClick={() => setVideoUrl(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <CreateVideoDialog
          isOpen={isCreateVideoDialogOpen}
          onClose={() => setIsCreateVideoDialogOpen(false)}
          onSubmit={handleCreateVideo}
          communityId={typeof id === 'string' ? parseInt(id, 10) : 0}
        />
      </div>
    </div>
  )
}
