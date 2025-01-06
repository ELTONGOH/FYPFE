import { authenticatedRequest } from '@/utils/apiUtils';

export interface Video {
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
  mediaUrls?: { mediaUrl: string }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  code: string | null;
}

export interface UploadVideoData {
  communityId: number;
  title: string;
  description: string;
  category: string;
  fee: number;
  type: 'LOCAL' | 'CROSS COMMUNITY';
  videoImage: string;
  mediaList: { mediaUrl: string }[];
}

export const uploadEducationalVideo = async (videoData: UploadVideoData): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest('/user-educational-video/upload', 'POST', videoData);
    return response;
  } catch (error) {
    console.error('Error uploading educational video:', error);
    throw error;
  }
};

export const getEducationalVideos = async (communityId: number): Promise<ApiResponse<Video[]>> => {
  try {
    const response = await authenticatedRequest(`/user-educational-video/get-videos?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching educational videos:', error);
    throw error;
  }
};

export const getOwnVideos = async (communityId: number): Promise<ApiResponse<Video[]>> => {
  try {
    const response = await authenticatedRequest(`/user-educational-video/get-own-videos?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching own videos:', error);
    throw error;
  }
};

export const viewVideo = async (videoId: number): Promise<ApiResponse<string>> => {
  try {
    const response = await authenticatedRequest(`/user-educational-video/view-video?videoId=${videoId}`, 'POST');
    return response;
  } catch (error) {
    console.error('Error viewing video:', error);
    throw error;
  }
};

export const downrackVideo = async (videoId: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authenticatedRequest(`/user-educational-video/downrack-video?videoId=${videoId}`, 'DELETE');
    return response;
  } catch (error) {
    console.error('Error downracking video:', error);
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

