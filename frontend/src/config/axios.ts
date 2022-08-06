import axios from "axios";

// fallback to localhost port 8000 if env variable is not specified
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_API_BASE_URL || "http://localhost:8000/";

axios.defaults.headers.post["Content-Type"] = "application/json";

const axiosRequest = async (method: string, url: string, body?: object) => {
  try {
    const resp = await axios({
      method,
      url,
      // add json body for post request
      ...(body
        && method !== "get" && {
        data: JSON.stringify(body),
      }),
    });
    return [resp.data, null];
  } catch (err) {
    // eslint-disable-next-line
    console.log(err);
    return [null, err];
  }
};

export default axiosRequest;
