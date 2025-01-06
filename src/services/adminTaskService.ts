import { authenticatedRequest } from '@/utils/apiUtils';

export interface AdminTask {
  taskId: number;
  title: string;
  description: string;
  rewardType: 'CREDIT' | 'POINT';
  rewardAmount: number;
  taskType: string;
  taskDifficulty: number;
  status: string;
  createdAt: string;
  communityId: number;
  communityName: string;
  creatorId: number;
  creatorName: string;
  maxParticipants: number;
  participants: {
    userId: number;
    username: string;
    fullName: string;
    status: string;
    submittedDescription: string | null;
  }[];
  mediaUrls: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  code: string | null;
}

export const getPendingTasks = async (communityId: number): Promise<ApiResponse<AdminTask[]>> => {
  try {
    const response = await authenticatedRequest(`/admin-task/pending-tasks?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    throw error;
  }
};

export const approveTask = async (taskId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-task/approve-task?taskId=${taskId}`, 'PUT');
    return response;
  } catch (error) {
    console.error('Error approving task:', error);
    throw error;
  }
};

export const rejectTask = async (taskId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-task/reject-task?taskId=${taskId}`, 'DELETE');
    return response;
  } catch (error) {
    console.error('Error rejecting task:', error);
    throw error;
  }
};

