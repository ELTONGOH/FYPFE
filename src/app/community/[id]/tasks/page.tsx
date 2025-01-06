"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, ChevronRight } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { getCreatedTasks, getJoinedTasks, getAvailableTasks, Task } from '@/services/userTaskService'
import TaskDetailsPopup from '@/components/TaskDetailsPopup'
import { CreateTaskForm } from '@/components/CreateTaskForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

const TaskCard = ({ task, onViewDetails }: { task: Task; onViewDetails: () => void }) => {
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

export default function CommunityTasksPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [createdTasks, setCreatedTasks] = useState<Task[]>([])
  const [joinedTasks, setJoinedTasks] = useState<Task[]>([])
  const [availableTasks, setAvailableTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false)

  const fetchTasks = async () => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      setIsLoading(true)
      try {
        const [createdResponse, joinedResponse, availableResponse] = await Promise.all([
          getCreatedTasks(),
          getJoinedTasks(),
          getAvailableTasks(communityId)
        ])

        if (createdResponse.success && createdResponse.data) {
          setCreatedTasks(createdResponse.data)
        }
        if (joinedResponse.success && joinedResponse.data) {
          setJoinedTasks(joinedResponse.data)
        }
        if (availableResponse.success && availableResponse.data) {
          setAvailableTasks(availableResponse.data)
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching tasks.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [id, toast])

  const refreshTasks = async (taskId: number): Promise<Task | null> => {
    await fetchTasks();
    const updatedTask = await getUpdatedTask(taskId);
    if (updatedTask) {
      setSelectedTask(updatedTask);
    }
    return updatedTask;
  };

  const getUpdatedTask = async (taskId: number): Promise<Task | null> => {
    const [createdResponse, joinedResponse, availableResponse] = await Promise.all([
      getCreatedTasks(),
      getJoinedTasks(),
      getAvailableTasks(parseInt(id as string, 10))
    ]);

    const allTasks = [
      ...(createdResponse.success && createdResponse.data ? createdResponse.data : []),
      ...(joinedResponse.success && joinedResponse.data ? joinedResponse.data : []),
      ...(availableResponse.success && availableResponse.data ? availableResponse.data : [])
    ];

    return allTasks.find(task => task.taskId === taskId) || null;
  };

  const handleBack = () => {
    router.push(`/community/${id}`)
  }

  const handleCreateTask = () => {
    setIsCreateTaskDialogOpen(true)
  }

  const renderTaskList = (tasks: Task[], sectionTitle: string, colorClass: string) => {
    const onBoardTasks = tasks.filter(task => task.status === 'ON BOARD');
    
    const filteredTasks = sectionTitle === "Available Tasks" 
      ? onBoardTasks.filter(task => 
          !createdTasks.some(createdTask => createdTask.taskId === task.taskId) &&
          !joinedTasks.some(joinedTask => joinedTask.taskId === task.taskId)
        )
      : onBoardTasks;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`text-xl font-bold ${colorClass}`}>{sectionTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.slice(0, 6).map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onViewDetails={() => setSelectedTask(task)}
                />
              ))}
            </div>
          ) : (
            <p>No active {sectionTitle.toLowerCase()} found.</p>
          )}
          {filteredTasks.length > 6 && (
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline"
                onClick={() => router.push(`/community/${id}/tasks/${sectionTitle.toLowerCase().replace(' ', '-')}`)}
                className="text-sm"
              >
                View More <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-7xl mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Community
        </button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Community Tasks</h1>
          <Button onClick={handleCreateTask} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" /> Create Task
          </Button>
        </div>

        {isLoading ? (
          <p>Loading tasks...</p>
        ) : (
          <>
            {renderTaskList(createdTasks, "Own Created Tasks", "text-green-600")}
            {renderTaskList(joinedTasks, "Joined Tasks", "text-yellow-600")}
            {renderTaskList(availableTasks, "Available Tasks", "text-blue-600")}
          </>
        )}
        
        <TaskDetailsPopup 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          taskType={
            createdTasks.some(task => task.taskId === selectedTask?.taskId)
              ? 'created'
              : joinedTasks.some(task => task.taskId === selectedTask?.taskId)
              ? 'joined'
              : 'available'
          }
          refreshTasks={refreshTasks}
        />

        <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <CreateTaskForm 
              communityId={parseInt(id as string, 10)} 
              onTaskCreated={() => {
                setIsCreateTaskDialogOpen(false)
                fetchTasks()
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

