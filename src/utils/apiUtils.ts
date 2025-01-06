import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const COMMON_URL = process.env.NEXT_PUBLIC_COMMON_API_URL;

export const publicRequest = async (endpoint: string, method: string = 'GET', data?: any, params?: any, headers?: any) => {
  const config: AxiosRequestConfig = {
    url: `${BASE_URL}${endpoint}`,
    method,
    data,
    params,
    headers,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

export const authenticatedRequest = async (endpoint: string, method: string = 'GET', data?: any, params?: any, headers?: any) => {
  const token = localStorage.getItem('accessToken');
  const config: AxiosRequestConfig = {
    url: `${COMMON_URL}${endpoint}`,
    method,
    data,
    params,
    headers: {
      ...headers,
      accessToken: token,
    },
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    throw error;
  }
};


