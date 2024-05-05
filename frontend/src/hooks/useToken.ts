import { useSelector } from 'react-redux';
import { selectToken } from 'reducers/identitySlice';

const useToken = (): string => {
  // TODO: handle refreshing if expired in here, and handle navigation or throwing errors

  console.log('-- useToken called');
  const token = useSelector(selectToken);

  return token ?? 'DUMMY_TOKEN';
};

export default useToken;
