import { authenticatedRequest } from '@/utils/apiUtils';

// Types and Interfaces
export interface Task {
  taskId: number;
  title: string;
  description: string;
  rewardType: any;
  rewardAmount: number;
  taskType: any;
  taskDifficulty: number;
  status: any;
  createdAt: string;
  maxParticipants: number;
  participants: Participant[];
  mediaUrls: string[];
}

export interface Participant {
    participantId: number;
    userId: number;
    fullName:string
    username: string;
    status: string;
    submittedDescription: string | null;
  }

interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
}

// General Task API
export const createTask = async (taskData: {
  communityId: number;
  title: string;
  description: string;
  rewardType: any;
  rewardAmount: number;
  taskType: any;
  taskDifficulty: number;
  maxParticipants: number;
  mediaList: { mediaUrl: string }[];
}): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest('/general-task/create-task', 'POST', taskData);
    return response;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// User Task APIs
export const getCreatedTasks = async (): Promise<ApiResponse<Task[]>> => {
  try {
    const response = await authenticatedRequest('/task/get-created-task', 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching created tasks:', error);
    throw error;
  }
};

export const getJoinedTasks = async (): Promise<ApiResponse<Task[]>> => {
  try {
    const response = await authenticatedRequest('/task/get-joined-task', 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching joined tasks:', error);
    throw error;
  }
};

export const getAvailableTasks = async (communityId: number): Promise<ApiResponse<Task[]>> => {
  try {
    const response = await authenticatedRequest(`/task/get-available-task?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching available tasks:', error);
    throw error;
  }
};

export const joinTask = async (taskId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/task/join-task?taskId=${taskId}`, 'POST', { taskId });
    return response;
  } catch (error) {
    console.error('Error joining task:', error);
    throw error;
  }
};

export const approveParticipant = async (taskId: number, userId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/task/approve-participant?taskId=${taskId}&userId=${userId}`, 'PUT', { taskId, userId });
    return response;
  } catch (error) {
    console.error('Error approving participant:', error);
    throw error;
  }
};

export const rejectParticipant = async (taskId: number, userId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/task/reject-participant?taskId=${taskId}&userId=${userId}`, 'DELETE', { taskId, userId });
    return response;
  } catch (error) {
    console.error('Error rejecting participant:', error);
    throw error;
  }
};

export const removeTask = async (taskId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/task/remove-task?taskId=${taskId}`, 'DELETE', { taskId });
    return response;
  } catch (error) {
    console.error('Error removing task:', error);
    throw error;
  }
};

export const submitParticipantDescription = async (
  taskId: number,
  participantId: number,
  submittedDescription: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest('/task/submit-description', 'POST', {
      taskId,
      participantId,
      submittedDescription,
    });
    return response;
  } catch (error) {
    console.error('Error submitting participant description:', error);
    throw error;
  }
};

export const completeTask = async (taskId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/task/complete-task?taskId=${taskId}`, 'PUT', { taskId });
    return response;
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

