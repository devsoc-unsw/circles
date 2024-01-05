import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from 'config/store';
import { setToken } from 'reducers/settingsSlice';

const GoogleAuthFlow = () => {
  const { settings } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallbackResponse = (response: google.accounts.id.CredentialResponse) => {
      const jwt = response.credential;
      dispatch(setToken(jwt));
      navigate('/degree-wizard');
      return 0;
    };
    if (settings.token) return;
    window.google.accounts.id.initialize({
      client_id: '1017197944285-i4ov50aak72667j31tuieffd8o2vd5md.apps.googleusercontent.com',
      callback: handleCallbackResponse
    });
    window.google.accounts.id.prompt();
  });

  return null;
};

export default GoogleAuthFlow;
