import axios from 'axios';
import { Programs } from 'types/api';
import { DegreeWizardPayload } from 'types/degreeWizard';
import { withAuthorization } from './auth';

export const setupDegreeWizard = async (token: string, wizard: DegreeWizardPayload) => {
  try {
    await axios.post('/user/setupDegreeWizard', wizard, {
      headers: withAuthorization(token)
    });
  } catch (err) {
    console.error('Error resetting degree at setupDegreeWizard: ', err);
    throw err;
  }
};

export const getAllDegrees = async (): Promise<Record<string, string>> => {
  const res = await axios.get<Programs>('/programs/getPrograms');
  return res.data.programs;
};
