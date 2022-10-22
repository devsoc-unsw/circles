/* eslint-disable */

import axios from 'axios';
import { APIEndpoints } from './types/endpoints';
import composeEndpoint from './composeEndpoint';

const API: APIEndpoints = {
  planner: {
    validate: (plannerData) => axios.post('/planner/validateTermPlanner', plannerData),
  },

  courses: {
    jsonified: (courseCode) => axios.get(`/courses/jsonified/${courseCode}`),
    course: (courseCode) => axios.get(`/courses/getCourse/${courseCode}`),
    search: (searchString, userData) => axios.post(`/courses/searchCourse/${searchString}`, userData),
    allUnlocked: (userData) => axios.post('/courses/getAllUnlocked', userData),
    legacyCourses: (year, term) => axios.get(`/courses/getLegacyCourses/${year}/${term}`),
    legacyCourse: (year, courseCode) => axios.get(`/courses/getLegacyCourse/${year}/${courseCode}`),
    unselect: (courseCode, userData) => axios.post(`/courses/unselectCourse/${courseCode}`, userData),
    children: (courseCode) => axios.get(`/courses/courseChildren/${courseCode}`),
    pathFrom: (courseCode) => axios.get(`/courses/getPathFrom/${courseCode}`),
    unlockedWhenTaken: (courseCode, userData) => axios.post(`/courses/coursesUnlockedWhenTaken/${courseCode}`, userData),
    termsOffered: (courseCode, years) => axios.get(`/courses/termsOffered/${courseCode}/${years.join('+')}`),
  },

  programs: {
    all: () => axios.get('/programs/getPrograms'),
    structure: (programCode: string, spec?: string) => axios.get(`/programs/getStructure/${composeEndpoint(programCode, spec)}`),
    courses: (programCode: string, spec?: string) => axios.get(`/programs/getStructureCourseList/${composeEndpoint(programCode, spec)}`),
    geneds: (programCode: string) => axios.get(`/programs/getGenEds/${programCode}`),
    graph: (programCode: string, spec?: string) => axios.get(`/programs/graph/${composeEndpoint(programCode, spec)}`),
    cores: (programCode: string, spec: string) => axios.get(`/programs/getCores/${programCode}/${spec}`),
  },

  specialisations: {
    types: (programCode: string) => axios.get(`/specialisations/getSpecialisationTypes/${programCode}`),
    specialisations: (programCode: string, type: string) => axios.get(`/specialisations/getSpecialisations/${programCode}/${type}`),
  },

  default: {
    liveYear: () => axios.get(`/live_year`),
  },
};

export default API;
