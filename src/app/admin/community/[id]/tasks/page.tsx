"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { getPendingTasks, approveTask, rejectTask, AdminTask } from '@/services/adminTaskService'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const StatusTag = ({ type, value }: { type: string; value: string | number }) => {
  let color = 'bg-gray-200 text-gray-800';
  let displayValue = value;
  if (type === 'rewardType') {
    color = value === 'CREDIT' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800';
  } else if (type === 'taskType') {
    color = 'bg-blue-200 text-blue-800';
  } else if (type === 'difficulty') {
    const difficultyColors = ['bg-green-200 text-green-800', 'bg-yellow-200 text-yellow-800', 'bg-orange-200 text-orange-800', 'bg-red-200 text-red-800', 'bg-purple-200 text-purple-800'];
    color = difficultyColors[Number(value) - 1] || 'bg-gray-200 text-gray-800';
    displayValue = `Difficulty: ${value}`;
  }
  return (
    <span className={`inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      {displayValue}
    </span>
  );
};

const TaskCard = ({ task, onViewDetails }: { task: AdminTask; onViewDetails: () => void }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4">{task.title}</h3>
        <div className="space-y-4">
          <p className="text-sm">Participants: {task.participants.length}/{task.maxParticipants}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm">Reward: {task.rewardAmount}</span>
            <StatusTag type="rewardType" value={task.rewardType} />
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusTag type="taskType" value={task.taskType} />
            <StatusTag type="difficulty" value={task.taskDifficulty} />
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

export default function AdminCommunityTasksPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [pendingTasks, setPendingTasks] = useState<AdminTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<AdminTask | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const fetchPendingTasks = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      setIsLoading(true)
      try {
        const response = await getPendingTasks(communityId)
        if (response.success && response.data) {
          setPendingTasks(response.data)
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch pending tasks.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching pending tasks:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching pending tasks.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchPendingTasks()
  }, [id, toast])

  const handleBack = () => {
    router.push(`/admin/community/${id}`)
  }

  const handleApproveTask = async (taskId: number) => {
    try {
      const response = await approveTask(taskId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Task approved successfully.",
        })
        setIsDetailsDialogOpen(false)
        fetchPendingTasks()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to approve task.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error approving task:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while approving the task.",
        variant: "destructive",
      })
    }
  }

  const handleRejectTask = async (taskId: number) => {
    try {
      const response = await rejectTask(taskId)
      if (response.success) {
        toast({
          title: "Success",
          description: "Task rejected successfully.",
        })
        setIsDetailsDialogOpen(false)
        fetchPendingTasks()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to reject task.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error rejecting task:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while rejecting the task.",
        variant: "destructive",
      })
    }
  }

  const handlePrevImage = () => {
    if (hasMediaUrls) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? selectedTask!.mediaUrls.length - 1 : prevIndex - 1
      )
    }
  }

  const handleNextImage = () => {
    if (hasMediaUrls) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === selectedTask!.mediaUrls.length - 1 ? 0 : prevIndex + 1
      )
    }
  }

  const hasMediaUrls = selectedTask?.mediaUrls && Array.isArray(selectedTask.mediaUrls) && selectedTask.mediaUrls.length > 0;
  const currentMediaUrl =
    hasMediaUrls && selectedTask.mediaUrls[currentImageIndex]
      ? typeof selectedTask.mediaUrls[currentImageIndex] === 'string'
        ? selectedTask.mediaUrls[currentImageIndex]
        : (selectedTask.mediaUrls[currentImageIndex] as { mediaUrl: string }).mediaUrl
      : null;
  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-7xl mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Community
        </button>

        <h1 className="text-2xl font-bold mb-6">Pending Community Tasks</h1>

        {isLoading ? (
          <p>Loading pending tasks...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTasks.map((task) => (
              <TaskCard
                key={task.taskId}
                task={task}
                onViewDetails={() => {
                  setSelectedTask(task)
                  setIsDetailsDialogOpen(true)
                }}
              />
            ))}
          </div>
        )}
        
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedTask?.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="relative w-full h-64 mb-4 bg-gray-100 rounded-lg overflow-hidden">
              
                {currentMediaUrl ? (
                  <Image
                    src={currentMediaUrl}
                    alt={`Task image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
                {hasMediaUrls && selectedTask.mediaUrls.length > 1 && (
                  <>
                    <Button
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              <p className="text-sm mb-2">{selectedTask?.description}</p>
              <p className="text-sm mb-2">Participants: {selectedTask?.participants.length}/{selectedTask?.maxParticipants}</p>
              <p className="text-sm mb-2">Reward: {selectedTask?.rewardAmount} <StatusTag type="rewardType" value={selectedTask?.rewardType || ''} /></p>
              <div className="flex flex-wrap gap-2 mb-2">
                <StatusTag type="taskType" value={selectedTask?.taskType || ''} />
                <StatusTag type="difficulty" value={selectedTask?.taskDifficulty || 0} />
              </div>
              <p className="text-sm mb-2">Status: {selectedTask?.status}</p>
              <p className="text-sm mb-2">Created At: {selectedTask?.createdAt ? new Date(selectedTask.createdAt).toLocaleString() : ''}</p>
              <p className="text-sm mb-2">Creator: {selectedTask?.creatorName}</p>
            </div>
            <DialogFooter>
              <Button onClick={() => handleRejectTask(selectedTask?.taskId || 0)} variant="destructive">
                Reject Task
              </Button>
              <Button onClick={() => handleApproveTask(selectedTask?.taskId || 0)}>
                Approve Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

