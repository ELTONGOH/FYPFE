import { authenticatedRequest } from '@/utils/apiUtils';

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
  timeStamp: string;
}

export interface WalletInfo {
  balance: number;
  points: number;
}

export interface Transaction {
  transactionId: string;
  transactionDate: string;
  amount: number;
  type: string;
}

export const getWalletInfo = async (): Promise<ApiResponse<WalletInfo>> => {
  try {
    const response = await authenticatedRequest('/user/wallet', 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    throw error;
  }
};

export const getTransactions = async (): Promise<ApiResponse<Transaction[]>> => {
  try {
    const response = await authenticatedRequest('/user/transactions', 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const topUpWallet = async (amount: number): Promise<ApiResponse<WalletInfo>> => {
  try {
    const response = await authenticatedRequest('/user/top-up-wallet', 'POST', null, { amount });
    return response;
  } catch (error) {
    console.error('Error topping up wallet:', error);
    throw error;
  }
};

export const withdrawFromWallet = async (amount: number): Promise<ApiResponse<WalletInfo>> => {
  try {
    const response = await authenticatedRequest('/user/withdraw-wallet', 'POST', null, { amount });
    return response;
  } catch (error) {
    console.error('Error withdrawing from wallet:', error);
    throw error;
  }
};

