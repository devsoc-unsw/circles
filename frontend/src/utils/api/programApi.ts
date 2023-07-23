/* eslint-disable */
import axios from "axios";
import { getToken } from "./userApi";
import { Programs, SearchCourse } from "types/api";

export const fetchAllDegrees = async (): Promise<Programs> => {
    const token = await getToken();
    const res = await axios.get('/programs/getPrograms');
    return res.data as Programs;
};