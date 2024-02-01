import axios from 'axios';
import { GraphPayload } from 'types/api';

// eslint-disable-next-line import/prefer-default-export
export const getProgramGraph = async (
  programCode: string,
  specs: string[]
): Promise<GraphPayload> => {
  const res = await axios.get(`/programs/graph/${programCode}/${specs.join('+')}`);
  return res.data as GraphPayload;
};
