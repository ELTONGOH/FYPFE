import { authenticatedRequest } from '@/utils/apiUtils';

export interface Community {
  communityId: number;
  name: string;
  location: string;
  maxParticipation: number;
  memberSharePercentage: number;
  managementSharePercentage: number;
  totalMembers: number;
  adminName: string;
  createdAt: string;
  rewardDistribution: {
    communityPercentage: number;
    taskParticipantPercentage: number;
  };
  advertisementDistribution: {
    userPercentage: number;
    communityPercentage: number;
  };
  questionnaireScores: {
    airQualityScore: number | null;
    waterQualityScore: number | null;
    environmentalScore: number | null;
    participantsCount: number;
  };
  membershipStatus: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  code: string | null;
}

export const getAllCommunities = async (): Promise<ApiResponse<Community[]>> => {
  try {
    const response = await authenticatedRequest('/user-community/get-all-communities', 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching available communities:', error);
    throw error;
  }
};

export const getAvailableCommunities = async (): Promise<ApiResponse<Community[]>> => {
  try {
    const response = await authenticatedRequest('/user-community/get-available-communities', 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching available communities:', error);
    throw error;
  }
};

export const getJoinedCommunities = async (): Promise<ApiResponse<Community[]>> => {
  try {
    const response = await authenticatedRequest('/user-community/get-joined-communities', 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching joined communities:', error);
    throw error;
  }
};

export const joinCommunity = async (communityId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/user-community/join-community?communityId=${communityId}`, 'POST');
    return response;
  } catch (error) {
    console.error('Error joining community:', error);
    throw error;
  }
};

export const leaveCommunity = async (communityId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/user-community/leave-community?communityId=${communityId}`, 'DELETE');
    return response;
  } catch (error) {
    console.error('Error leaving community:', error);
    throw error;
  }
};

export interface CommunityDetails {
  communityId: number;
  name: string;
  location: string;
  maxParticipation: number;
  memberSharePercentage: number;
  managementSharePercentage: number;
  adminName: string;
  totalMembers: number;
  membershipStatus: string;
  rewardDistribution: {
    communityPercentage: number;
    taskParticipantPercentage: number;
  };
  advertisementDistribution: {
    communityPercentage: number;
    userPercentage: number;
  };
  questionnaireScores: {
    airQualityScore: number;
    waterQualityScore: number;
    environmentalScore: number;
    participantsCount: number;
  };
}


export const getCommunityDetails = async (communityId: number): Promise<ApiResponse<CommunityDetails>> => {
  try {
    const response = await authenticatedRequest(`/user-community/get-community-details?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching community details:', error);
    throw error;
  }
};

