import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IdentityResponse, refreshTokens } from 'utils/api/auth';

type CompleteIdentity = {
  token: string;
  userId: string;
  expiresAt: number;
};

type IdleSliceState = {
  data: CompleteIdentity | undefined;
  status?: { isRefreshing: false };
};

type RefreshingSliceState = {
  data: CompleteIdentity | undefined;
  status: { isRefreshing: true; currReqId: string };
};

// Either we have the entire identity or no properties at all...
type IdentitySliceState = IdleSliceState | RefreshingSliceState;

export const initialIdentityState: IdentitySliceState = {
  data: undefined
};

// it goes condition -> pending action -> async call
// so if we reject in condition on isRefreshing, currRefresh and expiry time (if not forced)
// and then set these up in the first pending, and ideally nothing else makes it through the condition
// TODO: is there risk that two make it through condition before pending sets up the first?
export const refreshIdentity = createAsyncThunk<
  IdentityResponse,
  boolean | undefined,
  { state: { identity: IdentitySliceState } }
>(
  'identity/refresh',
  async () => {
    console.info('++ fetching');
    const res = await refreshTokens();

    return {
      exp: Date.now() + 5000,
      session_token: res.session_token,
      uid: res.uid
    };
  },
  {
    condition: (force, thunkAPI) => {
      // make sure that we dont double refresh or fire a mega delayed refresh
      const { status, data } = thunkAPI.getState().identity;
      return (force || !data || data.expiresAt < Date.now()) && !(status && status.isRefreshing);
    }
  }
);

const identitySlice = createSlice({
  name: 'identity',
  initialState: initialIdentityState as IdentitySliceState, // make sure it infers the correct type
  selectors: {
    selectToken: (state) => state.data?.token,
    selectIdentity: (state) => state.data
  },
  reducers: {
    updateIdentity: (state, action: PayloadAction<CompleteIdentity>) => {
      state.data = action.payload;
    },
    updateIdentityWithAPIRes: (state, action: PayloadAction<IdentityResponse>) => {
      state.data = {
        expiresAt: action.payload.exp,
        token: action.payload.session_token,
        userId: action.payload.uid
      };
    },
    unsetIdentity: () => initialIdentityState
  },
  extraReducers: (builder) => {
    builder.addCase(refreshIdentity.pending, (state, action) => {
      // gets there before the first async function, so open the door to only the first one
      if (!state.status || !state.status.isRefreshing) {
        state.status = {
          currReqId: action.meta.requestId,
          isRefreshing: true
        };
      }
    });

    builder.addCase(refreshIdentity.fulfilled, (state, action) => {
      // ideally we only reach here with allowed in, but make sure
      if (state.status && state.status.isRefreshing) {
        if (state.status.currReqId !== action.meta.requestId) {
          console.error('Wrong refreshIdentity thunk fulfilled, cannot confirm token');
          return {
            data: undefined
          };
        }

        return {
          data: {
            expiresAt: action.payload.exp,
            token: action.payload.session_token,
            userId: action.payload.uid
          }
        };
      }

      return state;
    });

    builder.addCase(refreshIdentity.rejected, (state, action) => {
      if (state.status && state.status.isRefreshing) {
        if (state.status.currReqId !== action.meta.requestId) {
          console.error('Wrong refreshIdentity thunk rejected, cannot confirm token');
          return {
            data: state.data
          };
        }

        return {
          data: undefined
        };
      }

      return state;
    });
  }
});

export const { updateIdentity, updateIdentityWithAPIRes, unsetIdentity } = identitySlice.actions;
export const { selectToken, selectIdentity } = identitySlice.selectors;

export default identitySlice.reducer;
