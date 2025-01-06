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
  message: string;
  data: T | null;
}

export const getAllAdvertisements = async (communityId: number): Promise<ApiResponse<Advertisement[]>> => {
  try {
    const response = await authenticatedRequest(`/admin-advertisement/get-all?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    throw error;
  }
};

export const approveAdvertisement = async (advertisementId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-advertisement/approve?advertisementId=${advertisementId}`, 'PUT');
    return response;
  } catch (error) {
    console.error('Error approving advertisement:', error);
    throw error;
  }
};

export const rejectAdvertisement = async (advertisementId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-advertisement/reject?advertisementId=${advertisementId}`, 'DELETE');
    return response;
  } catch (error) {
    console.error('Error rejecting advertisement:', error);
    throw error;
  }
};

export const validateAndDistributeAdvertisements = async (): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest('/admin-advertisement/validate-and-distribute', 'POST');
    return response;
  } catch (error) {
    console.error('Error validating and distributing advertisements:', error);
    throw error;
  }
};

export const distributeRewards = async (communityId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-advertisement/distribute-rewards?communityId=${communityId}`, 'POST');
    return response;
  } catch (error) {
    console.error('Error distributing rewards:', error);
    throw error;
  }
};

export const downrackAdvertisement = async (advertisementId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/investor-advertisement/downrack?advertisementId=${advertisementId}`, 'Delete');
    return response;
  } catch (error) {
    console.error('Error downracking advertisement:', error);
    throw error;
  }
};

export const validateAdvertisements = async (communityId: number): Promise<ApiResponse<null>> => {
    try {
      const response = await authenticatedRequest(`/admin-advertisement/validate`, 'POST');
      return response;
    } catch (error) {
      console.error('Error validating advertisements:', error);
      throw error;
    }
  };

