/* eslint-disable */
import axios from "axios";
import { getToken } from "./userApi";
import { SearchCourse } from "types/api";

export const handleSearchCourse = async (query: String, degree: any, planner: any): Promise<SearchCourse> => {
  const token = await getToken();
  const res = await axios.post(`/courses/searchCourse/${query}`, { params: { token } });
  return res.data as SearchCourse;
}
