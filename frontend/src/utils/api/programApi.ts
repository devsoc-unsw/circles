import axios from 'axios';
import { Programs } from 'types/api';

// eslint-disable-next-line import/prefer-default-export
export const fetchAllDegrees = async (): Promise<Programs> => {
  const res = await axios.get('/programs/getPrograms');
  return res.data as Programs;
};
