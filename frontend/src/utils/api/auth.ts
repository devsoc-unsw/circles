import axios, { AxiosError } from 'axios';
import { getToken } from './userApi';

export enum TokenStatus {
  UNSET,
  INVALID,
  NOTSETUP,
  VALID
}

export const checkTokenStatus = async (): Promise<TokenStatus> => {
  // TODO: on very first load since storage hasnt yet finished setting up, will get undefined errors
  const token = await getToken();
  if (!token) {
    return TokenStatus.UNSET;
  }

  // check token with backend
  try {
    await axios.get<never>('/auth/checkToken', { params: { token } });
    return TokenStatus.VALID;
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.response?.status === 401) return TokenStatus.INVALID;
      if (e.response?.status === 403) return TokenStatus.NOTSETUP;
    }
    throw e;
  }
};

export const exchangeAuthCode = async (code: string, state: string): Promise<string> => {
  console.log(`exchanging ${state} ${code}`);
  const res = await axios.post<string>('/auth/login', { code, state });
  console.log('exchange result:', res);
  return res.data;
};
