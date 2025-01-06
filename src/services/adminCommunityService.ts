import { authenticatedRequest } from '@/utils/apiUtils';

export interface AdminCommunity {
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
    airQualityScore: number;
    waterQualityScore: number;
    environmentalScore: number;
    participantsCount: number;
  };
  membershipStatus: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  code: string | null;
}

export const getAdminCommunities = async (): Promise<ApiResponse<AdminCommunity[]>> => {
  try {
    const response = await authenticatedRequest('/admin-community/get-communities', 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching admin communities:', error);
    throw error;
  }
};

export const createAnnouncement = async (communityId: number, title: string, content: string): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-community/create-announcement?communityId=${communityId}`, 'POST', { title, content });
    return response;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (announcementId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-community/delete-announcement?announcementId=${announcementId}`, 'DELETE');
    return response;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};


export const distributeRewards = async (communityId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-community/general-community/distribute-rewards?communityId=${communityId}`, 'POST');
    return response;
  } catch (error) {
    console.error('Error distributing rewards:', error);
    throw error;
  }
};

export interface PendingMember {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  status: string;
}

export interface ExistedRange {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

export const getPendingMembers = async (communityId: number): Promise<ApiResponse<PendingMember[]>> => {
  try {
    const response = await authenticatedRequest(`/admin-community/view-pending-members?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching pending members:', error);
    throw error;
  }
};

export const approveMember = async (communityId: number, userId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-community/approve-member?communityId=${communityId}&userId=${userId}`, 'PUT');
    return response;
  } catch (error) {
    console.error('Error approving member:', error);
    throw error;
  }
};

export const rejectMember = async (communityId: number, userId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-community/reject-member?communityId=${communityId}&userId=${userId}`, 'PUT');
    return response;
  } catch (error) {
    console.error('Error rejecting member:', error);
    throw error;
  }
};

export const updateCommunity = async (communityId: number, data: {
  maxParticipation: number;
  memberSharePercentage: number;
  managementSharePercentage: number;
  communityPercentage: number;
  taskParticipantPercentage: number;
}): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-community/update-community?communityId=${communityId}`, 'PUT', data);
    return response;
  } catch (error) {
    console.error('Error updating community:', error);
    throw error;
  }
};

export const updateAdvertisementDistribution = async (communityId: number, data: {
  userPercentage: number;
  communityPercentage: number;
}): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-community/update-advertisement-distribution?communityId=${communityId}`, 'PUT', data);
    return response;
  } catch (error) {
    console.error('Error updating advertisement distribution:', error);
    throw error;
  }
};

export const fetchExistedLocationRanges = async (location: string): Promise<ApiResponse<ExistedRange[]>> => {
  try {
    const response = await authenticatedRequest(`/admin-community/fetch-existed-location-range?location=${encodeURIComponent(location)}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching existed location ranges:', error);
    throw error;
  }
};

export interface CreateCommunityRequest {
  name: string;
  location: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  maxParticipation: number;
  memberSharePercentage: number;
  managementSharePercentage: number;
  adminId: number;
  communityPercentage: number;
  taskParticipantPercentage: number;
}

export const createCommunity = async (data: CreateCommunityRequest): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest('/admin-community/create-community', 'POST', data);
    return response;
  } catch (error) {
    console.error('Error creating community:', error);
    throw error;
  }
};