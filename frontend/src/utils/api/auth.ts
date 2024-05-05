import axios from 'axios';
// import store from 'config/store';

export enum TokenStatus {
  UNSET,
  INVALID,
  NOTSETUP,
  VALID
}

interface OldIdentityPayload {
  session_token: string;
}

export type IdentityResponse = {
  session_token: string;
  exp: number;
  uid: string;
};

export const guestLogin = async (): Promise<IdentityResponse> => {
  const res = await axios.post<IdentityResponse>(
    '/auth/guest_login',
    {},
    { withCredentials: true }
  );

  return res.data;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export const checkTokenStatus = async (token: string | undefined): Promise<TokenStatus> => {
  // TODO: on very first load since storage hasnt yet finished setting up, will get undefined errors
  console.log('-- checking token status');
  if (token === undefined) {
    return TokenStatus.UNSET;
  }

  return TokenStatus.VALID;

  // // check token with backend
  // try {
  //   await axios.get<never>('/auth/checkToken', { headers: { Authorization: `Bearer ${token}` } });
  //   return TokenStatus.VALID;
  // } catch (e) {
  //   if (e instanceof AxiosError) {
  //     if (e.response?.status === 401) return TokenStatus.INVALID;
  //     if (e.response?.status === 403) return TokenStatus.NOTSETUP;
  //   }
  //   throw e;
  // }
};

export const exchangeAuthCode = async (
  query_params: Record<string, string>
): Promise<OldIdentityPayload> => {
  console.log(`exchanging`);
  const res = await axios.post<OldIdentityPayload>(
    '/auth/login',
    { query_params },
    { withCredentials: true }
  );
  console.log('exchange result:', res);
  return res.data;
};

export const refreshTokens = async (): Promise<IdentityResponse> => {
  // NOTE: will raise a 401 if could not refresh
  console.log('-- refreshing tokens');
  const res = await axios.post<IdentityResponse>('/auth/refresh', {}, { withCredentials: true });

  return res.data;
};
