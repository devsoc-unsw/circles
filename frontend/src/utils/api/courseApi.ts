/* eslint-disable */
import axios from "axios";
import { getToken } from "./userApi";
import { Programs, SearchCourse } from "types/api";

export const handleSearchCourse = async (query: String): Promise<SearchCourse> => {
  const token = await getToken();
  const res = await axios.post(`/courses/searchCourse/${query}`, { params: { token } });
  return res.data as SearchCourse;
}
