import { authenticatedRequest } from '@/utils/apiUtils';

export interface AdminVideo {
  videoId: number;
  title: string;
  description: string;
  category: string;
  fee: number;
  type: 'LOCAL' | 'CROSS COMMUNITY';
  status: string;
  uploadedAt: string;
  videoImageUrl: string;
  view: number;
  mediaUrls: { mediaUrl: string }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  code: string | null;
}

export const getPendingVideos = async (communityId: number): Promise<ApiResponse<AdminVideo[]>> => {
  try {
    const response = await authenticatedRequest(`/admin-video/pending-videos?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching pending videos:', error);
    throw error;
  }
};

export const approveVideo = async (videoId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-video/approve-video?videoId=${videoId}`, 'PUT');
    return response;
  } catch (error) {
    console.error('Error approving video:', error);
    throw error;
  }
};

export const rejectVideo = async (videoId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/admin-video/reject-video?videoId=${videoId}`, 'DELETE');
    return response;
  } catch (error) {
    console.error('Error rejecting video:', error);
    throw error;
  }
};

export const VIDEO_CATEGORIES = [
  'Waste Management and Recycling',
  'Renewable Energy and Sustainability',
  'Water Conservation and Protection',
  'Climate Change Awareness',
  'Wildlife and Biodiversity Protection',
  'Sustainable Agriculture and Food Systems',
  'Environmental Policies and Laws',
  'Eco-Friendly Technologies',
  'Disaster Preparedness and Management',
  'Environmental Education for Kids'
] as const;

export type VideoCategory = typeof VIDEO_CATEGORIES[number];

