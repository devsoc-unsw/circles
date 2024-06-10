import axios from 'axios';

export type IdentityResponse = {
  session_token: string;
  exp: number;
  uid: string;
};

export const withAuthorization = (token: string) => {
  if (typeof token !== 'string' || token.length === 0) {
    throw TypeError('Token must be a string of length > 0', { cause: { token } });
  }

  return { Authorization: `Bearer ${token}` };
};

export const guestLogin = async (): Promise<IdentityResponse> => {
  const res = await axios.post<IdentityResponse>(
    '/auth/guest_login',
    {},
    { withCredentials: true }
  );

  return res.data;
};

export const logout = async (token: string): Promise<void> => {
  await axios.delete<void>('/auth/logout', {
    withCredentials: true,
    headers: { ...withAuthorization(token) }
  });
};

export const CSELogin = async (query_params: Record<string, string>): Promise<IdentityResponse> => {
  const res = await axios.post<IdentityResponse>(
    '/auth/login',
    { oidc_response: query_params },
    { withCredentials: true }
  );

  return res.data;
};

export const refreshTokens = async (): Promise<IdentityResponse> => {
  // NOTE: will raise a 401 if could not refresh
  console.log('-- refreshing tokens');
  const res = await axios.post<IdentityResponse>('/auth/refresh', {}, { withCredentials: true });

  return res.data;
};