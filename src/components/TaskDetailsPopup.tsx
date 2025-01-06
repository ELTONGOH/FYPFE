"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Task, Participant, joinTask, approveParticipant, rejectParticipant, removeTask, submitParticipantDescription, completeTask } from '@/services/userTaskService'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
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

interface TaskDetailsPopupProps {
  task: Task | null
  onClose: () => void
  taskType: 'created' | 'joined' | 'available'
  refreshTasks: (taskId: number) => Promise<Task | null>
}

const StatusTag = ({ type, value }: { type: string; value: string | number }) => {
  let color = 'bg-gray-200 text-gray-800';
  let displayValue = value;
  if (type === 'rewardType') {
    color = value === 'CREDIT' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800';
  } else if (type === 'taskType') {
    color = value === 'LOCAL' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800';
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

const TaskDetailsPopup: React.FC<TaskDetailsPopupProps> = ({ task, onClose, taskType, refreshTasks }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => async () => {});
  const [confirmMessage, setConfirmMessage] = useState("");
  const [description, setDescription] = useState("");
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const { toast } = useToast();

  if (!task) return null;

  const hasMediaUrls = task.mediaUrls && Array.isArray(task.mediaUrls) && task.mediaUrls.length > 0;
  const currentMediaUrl =
    hasMediaUrls && task.mediaUrls[currentImageIndex]
      ? typeof task.mediaUrls[currentImageIndex] === 'string'
        ? task.mediaUrls[currentImageIndex]
        : (task.mediaUrls[currentImageIndex] as { mediaUrl: string }).mediaUrl
      : null;

  const handlePrevImage = () => {
    if (hasMediaUrls) {
      setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? task.mediaUrls.length - 1 : prevIndex - 1));
    }
  };

  const handleNextImage = () => {
    if (hasMediaUrls) {
      setCurrentImageIndex((prevIndex) => (prevIndex === task.mediaUrls.length - 1 ? 0 : prevIndex + 1));
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmAction();
      setIsConfirmDialogOpen(false);
      onClose();
      await refreshTasks(task.taskId);
    } catch (error) {
      console.error('Error performing action:', error);
      toast({
        title: "Error",
        description: "An error occurred while performing the action.",
        variant: "destructive",
      });
    }
  };

  const handleApproveUser = (userId: number) => {
    setConfirmAction(() => async () => {
      await approveParticipant(task.taskId, userId);
      toast({
        title: "Success",
        description: "Participant approved successfully.",
      });
    });
    setConfirmMessage("Are you sure you want to approve this participant?");
    setIsConfirmDialogOpen(true);
  };

  const handleRejectUser = (userId: number) => {
    setConfirmAction(() => async () => {
      await rejectParticipant(task.taskId, userId);
      toast({
        title: "Success",
        description: "Participant rejected successfully.",
      });
    });
    setConfirmMessage("Are you sure you want to reject this participant?");
    setIsConfirmDialogOpen(true);
  };

  const handleRemoveUser = (userId: number) => {
    setConfirmAction(() => async () => {
      await rejectParticipant(task.taskId, userId);
      toast({
        title: "Success",
        description: "Participant removed successfully.",
      });
    });
    setConfirmMessage("Are you sure you want to remove this participant?");
    setIsConfirmDialogOpen(true);
  };

  const handleSubmitDescription = async () => {
    if (!task) return;
    const currentParticipant = task.participants.find(p => p.status === 'JOINED');
    if (!currentParticipant) {
      toast({
        title: "Error",
        description: "You are not a participant of this task.",
        variant: "destructive",
      });
      return;
    }
    try {
      await submitParticipantDescription(task.taskId, currentParticipant.participantId, description);
      setIsDescriptionDialogOpen(false);
      setDescription("");
      onClose();
      await refreshTasks(task.taskId);
      toast({
        title: "Success",
        description: "Description submitted successfully.",
      });
    } catch (error) {
      console.error('Error submitting description:', error);
      toast({
        title: "Error",
        description: "An error occurred while submitting the description.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteJob = () => {
    setConfirmAction(() => async () => {
      await completeTask(task.taskId);
      toast({
        title: "Success",
        description: "Task completed successfully.",
      });
      onClose();
      refreshTasks(task.taskId);
    });
    setConfirmMessage("Are you sure you want to complete this task?");
    setIsConfirmDialogOpen(true);
  };

  const handleJoinTask = () => {
    setConfirmAction(() => async () => {
      await joinTask(task.taskId);
      toast({
        title: "Success",
        description: "You have joined the task successfully.",
      });
      onClose();
      refreshTasks(task.taskId);
    });
    setConfirmMessage("Are you sure you want to join this task?");
    setIsConfirmDialogOpen(true);
  };

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Task details and management interface
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Task Details</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
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
                {hasMediaUrls && task.mediaUrls.length > 1 && (
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
              <p className="text-sm mb-2">{task.description}</p>
              <p className="text-sm mb-2">Participants: {task.participants.length}/{task.maxParticipants}</p>
              <p className="text-sm mb-2">Reward: {task.rewardAmount} <StatusTag type="rewardType" value={task.rewardType} /></p>
              <div className="flex flex-wrap gap-2 mb-2">
                <StatusTag type="taskType" value={task.taskType} />
                <StatusTag type="difficulty" value={task.taskDifficulty} />
              </div>
              <p className="text-sm mb-2">Status: {task.status}</p>
              <p className="text-sm mb-2">Created At: {new Date(task.createdAt).toLocaleString()}</p>
            </div>
          </TabsContent>
          <TabsContent value="participants">
            <div className="mt-4 max-h-[300px] overflow-y-auto">
              {task.participants.length > 0 ? (
                task.participants.map((participant: Participant) => (
                  <div key={`participant-${participant.participantId}-${participant.userId}`} className="mb-4 p-4 border rounded">
                    <p className="font-bold">{participant.fullName}</p>
                    <p className="text-sm mb-2">Status: {participant.status}</p>
                    <p className="text-sm mb-2">
                      Description: {participant.submittedDescription || "No work description"}
                    </p>
                    {taskType === 'created' && (
                      <div className="flex gap-2">
                        {participant.status === 'PENDING' && (
                          <>
                            <Button onClick={() => handleApproveUser(participant.userId)}>
                              Approve User
                            </Button>
                            <Button onClick={() => handleRejectUser(participant.userId)} variant="destructive">
                              Reject User
                            </Button>
                          </>
                        )}
                        {participant.status === 'JOINED' && (
                          <>
                            <Button onClick={() => setIsDescriptionDialogOpen(true)}>
                              Submit Description
                            </Button>
                            <Button onClick={() => handleRemoveUser(participant.userId)} variant="destructive">
                              Remove User
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No participants yet</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-4 flex justify-end">
          {taskType === 'created' && (
            <Button onClick={handleCompleteJob} className="bg-green-500 hover:bg-green-600">Complete Job</Button>
          )}
          {taskType === 'available' && (
            <Button onClick={handleJoinTask} className="bg-yellow-500 hover:bg-yellow-600">Join Task</Button>
          )}
        </div>
      </DialogContent>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Description</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSubmitDescription}>Submit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default TaskDetailsPopup;

