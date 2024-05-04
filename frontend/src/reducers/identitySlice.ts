import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { IdentityResponse } from 'utils/api/auth';

type CompleteIdentity = {
  token: string;
  userId: string;
  expiresAt: number;
};

type EmptyIdentity = {
  token: undefined;
  userId: undefined;
  expiresAt: undefined;
};

// Either we have the entire identity or no properties at all...
type IdentitySliceState = CompleteIdentity | EmptyIdentity;

export const initialIdentityState: IdentitySliceState = {
  token: undefined,
  userId: undefined,
  expiresAt: undefined
};

const identitySlice = createSlice({
  name: 'identity',
  initialState: initialIdentityState as IdentitySliceState, // make sure it infers the correct type
  reducers: {
    updateIdentity: (state, action: PayloadAction<CompleteIdentity>) => {
      state.expiresAt = action.payload.expiresAt;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
    },
    updateIdentityWithAPIRes: (state, action: PayloadAction<IdentityResponse>) => {
      state.expiresAt = action.payload.exp;
      state.token = action.payload.session_token;
      state.userId = action.payload.uid;
    },
    unsetIdentity: () => initialIdentityState
  },
  selectors: {
    selectToken: (state) => state.token,
    selectIdentity: (state) => state
  }
});

export const { updateIdentity, updateIdentityWithAPIRes, unsetIdentity } = identitySlice.actions;
export const { selectToken, selectIdentity } = identitySlice.selectors;

export default identitySlice.reducer;
