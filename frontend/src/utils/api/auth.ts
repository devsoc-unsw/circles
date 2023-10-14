import axios, { AxiosError } from 'axios';
import { getToken } from './userApi';

export enum TokenStatus {
  UNSET,
  INVALID,
  NOTSETUP,
  VALID
}

interface IdentityPayload {
  session_token: string;
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

export const exchangeAuthCode = async (code: string, state: string): Promise<IdentityPayload> => {
  console.log(`exchanging ${state} ${code}`);
  const res = await axios.post<IdentityPayload>(
    '/auth/login',
    { code, state },
    { withCredentials: true }
  );
  console.log('exchange result:', res);
  return res.data;
};

export const getSessionToken = async (): Promise<IdentityPayload> => {
  // TODO: try this
  const res = await axios.get<IdentityPayload>('/auth/identity', { withCredentials: true });
  return res.data;
};
