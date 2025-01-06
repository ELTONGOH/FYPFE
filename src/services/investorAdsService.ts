import { authenticatedRequest } from '@/utils/apiUtils';

export interface Advertisement {
  advertisementId: number;
  title: string;
  description: string;
  type: string;
  uploadDuration: number;
  fee: number;
  status: string;
  createdAt: string;
  uploadAt: string;
  mediaUrls: { mediaUrl: string }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  code: string | null;
}

export const createAdvertisement = async (adData: {
  communityId: number;
  title: string;
  description: string;
  type: string;
  uploadDuration: number;
  fee: number;
  mediaList: { mediaUrl: string }[];
}): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest('/investor-advertisement/create', 'POST', adData);
    return response;
  } catch (error) {
    console.error('Error creating advertisement:', error);
    throw error;
  }
};

export const getInvestorAds = async (): Promise<ApiResponse<Advertisement[]>> => {
  try {
    const response = await authenticatedRequest('/investor-advertisement/get-my-ads', 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching investor advertisements:', error);
    throw error;
  }
};

export const downrackAdvertisement = async (advertisementId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/investor-advertisement/downrack?advertisementId=${advertisementId}`, 'DELETE');
    return response;
  } catch (error) {
    console.error('Error downracking advertisement:', error);
    throw error;
  }
};

