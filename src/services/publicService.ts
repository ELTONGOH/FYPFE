import axios, { AxiosError } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiResponse {
  success: boolean;
  data: any | null;
  message: string | null;
  code: string | null;
}

export const login = async (username: string, password: string): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, { username, password });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const signup = async (userData: {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
}): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/signup`, userData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

const handleApiError = (error: unknown): ApiResponse => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    if (axiosError.response) {
      return axiosError.response.data;
    } else if (axiosError.request) {
      console.error('No response received');
      return {
        success: false,
        data: null,
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        code: 'NO_RESPONSE'
      };
    }
  }
  console.error('Unexpected error:', error);
  return {
    success: false,
    data: null,
    message: 'An unexpected error occurred',
    code: 'UNEXPECTED_ERROR'
  };
};

