import axios from 'axios';
import { Programs } from 'types/api';

export const fetchAllDegrees = async (): Promise<Programs> => {
  const res = await axios.get('/programs/getPrograms');
  return res.data as Programs;
};
