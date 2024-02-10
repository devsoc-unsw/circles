import axios, { AxiosError } from 'axios';
// import store from 'config/store';

export enum TokenStatus {
  UNSET,
  INVALID,
  NOTSETUP,
  VALID
}

interface IdentityPayload {
  session_token: string;
}

// export const getToken = (): string => {
//   console.log('-- getting token from storage: ');
//   const state = store.getState(); // TODO: this seems to go to default on first load? check this though
//   console.log('-- token:', state.settings.token);
//   if (state.settings.token === null) {
//     throw Error('TODO: token was not set'); // TODO: rethink how to handle this
//   }

//   return state.settings.token;
// };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const checkTokenStatus = async (token: string | null): Promise<TokenStatus> => {
  // TODO: on very first load since storage hasnt yet finished setting up, will get undefined errors
  console.log('-- checking token status');
  // const token: string | null = getToken();
  if (token === null) {
    return TokenStatus.UNSET;
  }

  // check token with backend
  try {
    await axios.get<never>('/auth/checkToken', { headers: { Authorization: `Bearer ${token}` } });
    return TokenStatus.VALID;
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.response?.status === 401) return TokenStatus.INVALID;
      if (e.response?.status === 403) return TokenStatus.NOTSETUP;
    }
    throw e;
  }
};

export const exchangeAuthCode = async (
  query_params: Record<string, string>
): Promise<IdentityPayload> => {
  console.log(`exchanging`);
  const res = await axios.post<IdentityPayload>(
    '/auth/login',
    { query_params },
    { withCredentials: true }
  );
  console.log('exchange result:', res);
  return res.data;
};

export const getSessionToken = async (): Promise<IdentityPayload | null> => {
  // TODO: try this, handle errors
  console.log('-- getting token from identity');
  try {
    const res = await axios.get<IdentityPayload>('/auth/identity', { withCredentials: true });
    return res.data;
  } catch {
    // TODO: handle this properly
    return null;
  }
};
