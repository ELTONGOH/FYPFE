import { authenticatedRequest } from '@/utils/apiUtils';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export const submitQuestionnaire = async (
  communityId: number,
  airQualityScores: number[],
  waterQualityScores: number[],
  environmentalScores: number[]
): Promise<ApiResponse> => {
  try {
    const response = await authenticatedRequest('/community-questionnaire/submit', 'POST', {
      communityId,
      airQualityScores,
      waterQualityScores,
      environmentalScores
    });
    return response;
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    throw error;
  }
};

export const checkEnterQuestionnaire = async (communityId: number): Promise<ApiResponse<boolean>> => {
  try {
    const response = await authenticatedRequest(`/community-questionnaire/enter-check?communityId=${communityId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error checking questionnaire entry:', error);
    throw error;
  }
};

