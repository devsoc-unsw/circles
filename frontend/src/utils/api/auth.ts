import axios, { AxiosError } from 'axios';
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

type IdentityPayload = {
  session_token: string;
  exp: number;
  uid: string;
};

// export const getToken = (): string => {
//   console.log('-- getting token from storage: ');
//   const state = store.getState(); // TODO: this seems to go to default on first load? check this though
//   console.log('-- token:', state.settings.token);
//   if (state.settings.token === null) {
//     throw Error('TODO: token was not set'); // TODO: rethink how to handle this
//   }

//   return state.settings.token;
// };

export const guestLogin = async (): Promise<IdentityPayload> => {
  const res = await axios.post<IdentityPayload>('/auth/guest_login', {}, { withCredentials: true });

  return res.data;
};

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

export const getSessionToken = async (): Promise<OldIdentityPayload | null> => {
  // TODO: try this, handle errors
  console.log('-- getting token from identity');
  try {
    const res = await axios.get<OldIdentityPayload>('/auth/identity', { withCredentials: true });
    return res.data;
  } catch {
    // TODO: handle this properly
    return null;
  }
};
