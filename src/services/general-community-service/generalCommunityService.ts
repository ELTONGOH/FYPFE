import { authenticatedRequest } from '@/utils/apiUtils';

// Common interface for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  code: string | null;
}

// Interfaces for the different data types
interface Announcement {
  announcementId: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface CommunityMember {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  effortPercentage: number;
  totalScore: number;
}

export interface CommunityWallet {
  walletId: number;
  balance: number;
  points: number;
  onHoldBalance: number;
  sourceType: string;
  lastUpdated: string;
}

export interface CommunityTransaction {
  transactionId: string;
  amount: number;
  type: string;
  transactionDate: string;
}

export interface CommunityReport {
  totalRevenue: number;
  advertisementRevenue: number;
  taskRevenue: number;
  videoRevenue: number;
  managementDistribution: number;
  communityMemberDistribution: number;
  totalMembersJoined: number;
  totalTasksCreated: number;
  totalVideosUploaded: number;
  totalAdvertisementsUploaded: number;
}

export interface QuestionnaireDetails {
  communityId: number;
  airQualityScore: number;
  waterQualityScore: number;
  environmentalScore: number;
  participantsCount: number;
  totalCommunityMembers: number;
  participationRate: number;
  participationRateState: string;
}

// API functions
export const getCommunityAnnouncements = async (communityId: number): Promise<ApiResponse<Announcement[]>> => {
  try {
    const response = await authenticatedRequest(`/general-community/get-announcements?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching community announcements:', error);
    throw error;
  }
};

export const getCommunityMembers = async (communityId: number): Promise<ApiResponse<CommunityMember[]>> => {
  try {
    const response = await authenticatedRequest(`/general-community/get-member-list?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching community members:', error);
    throw error;
  }
};

export const getCommunityWallet = async (communityId: number): Promise<ApiResponse<CommunityWallet>> => {
  try {
    const response = await authenticatedRequest(`/general-community/get-community-wallet?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching community wallet:', error);
    throw error;
  }
};

export const getCommunityTransactions = async (communityId: number): Promise<ApiResponse<CommunityTransaction[]>> => {
  try {
    const response = await authenticatedRequest(`/general-community/get-community-transaction?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching community transactions:', error);
    throw error;
  }
};

export const donateToCommunity = async (communityId: number, amount: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest('/general-community/donate-to-community', 'POST', { communityId, amount });
    return response;
  } catch (error) {
    console.error('Error donating to community:', error);
    throw error;
  }
};

export const getUserWallet = async (): Promise<ApiResponse<{ balance: number }>> => {
  try {
    const response = await authenticatedRequest('/user/wallet', 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching user wallet:', error);
    throw error;
  }
};

export const generateCommunityReport = async (communityId: number, startDate: string, endDate: string): Promise<ApiResponse<CommunityReport>> => {
  try {
    const response = await authenticatedRequest('/report/generate-community-report', 'POST', { communityId, startDate, endDate });
    return response;
  } catch (error) {
    console.error('Error generating community report:', error);
    throw error;
  }
};

export const getCommunityQuestionnaireDetails = async (communityId: number): Promise<ApiResponse<QuestionnaireDetails>> => {
  try {
    const response = await authenticatedRequest(`/community-questionnaire/get-question-details?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching community questionnaire details:', error);
    throw error;
  }
};

