import { authenticatedRequest } from '@/utils/apiUtils';

interface VotePercentageResponse {
  totalMembers: number;
  totalVotes: number;
  percentage: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  code?: string;
}

export const getVotePercentage = async (communityId: string): Promise<ApiResponse<VotePercentageResponse>> => {
  try {
    const response = await authenticatedRequest(`/vote/get-vote-percentage?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching vote percentage:', error);
    throw error;
  }
};

export const voteForNewAdmin = async (communityId: string, newAdminId: string): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/vote/vote-admin?communityId=${communityId}&newAdminId=${newAdminId}`, 'POST');
    return response;
  } catch (error) {
    console.error('Error voting for new admin:', error);
    throw error;
  }
};

