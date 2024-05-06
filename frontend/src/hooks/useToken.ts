/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { useAppDispatch, useAppSelector } from 'hooks';
import { refreshIdentity, selectIdentity, selectToken } from 'reducers/identitySlice';

type AllowUnsetOptions = {
  allowUnset: true;
};

type BaseOptions = {
  allowUnset?: false;
};

type Options = AllowUnsetOptions | BaseOptions | undefined;

function useToken(options: AllowUnsetOptions): string | undefined;
function useToken(options: BaseOptions): string;
function useToken(): string;
function useToken(options?: Options): string | undefined;
// need this general one to allow for dynamically-created params to still match a type
// since something like { allowUnset: 100 === 200 } will be type boolean, and thus no return value can be inferred

function useToken(options?: Options): string | undefined {
  // TODO: handle refreshing if expired in here, and handle navigation or throwing errors
  // const { token, expiresAt } = useAppSelector(selectIdentity) ?? {};
  const token = useAppSelector(selectToken);
  // console.log('-- useToken called', token);

  // TODO: major flaw - what if there are no rerenders before it expires
  // const dispatch = useAppDispatch();
  // if (expiresAt !== undefined && expiresAt < Date.now()) {
  //   console.log('++ dispatching a refresh identity');
  //   dispatch(refreshIdentity())
  //     .unwrap()
  //     .catch((e) => console.info('lolol error', e));
  // }

  if (token === undefined && options?.allowUnset !== true) {
    // This shouldn't occur of useToken is used inside a RequireToken
    // NOTE: error boundary cannot catch this :|
    throw TypeError('useToken: allowUnset was false when token was undefined.', {
      cause: { token, allowUnset: !!options?.allowUnset }
    });
  }

  return token;

  // if (options?.allowUnset) {
  //   return token;
  // }
  // return token ?? 'DUMMY_TOKEN';
}

export default useToken;

// Three ideas on how to manage refreshing
// - check expiry on every useToken mount or new mount
//   - issue is what if there aren't any new mounts before the expiry?
//     This is rare, since react query will likely cause atleast one rerender.
//   - also an issue that every useToken will dispatch,
//     and although this is mitigated, also a consideration, and idk about race conditions
// - use a timeout either in every useToken, or just at the IdentityProvider level
//   - kinda cop out, but would definitely work
// - set up a interceptor for axios that auto refreshes on a 401 and retries
//   - would also need to be setup in the IdentityProvider, want to becareful to not double set this up
//   - would need a custom client to be created as well for user related axios

// currently got timeout setup just for debug sake
