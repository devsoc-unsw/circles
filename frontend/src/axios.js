import axios from "axios";

// fallback to localhost port 8000 if env variable is not specified
axios.defaults.baseURL =
  process.env.REACT_APP_BACKEND_API_BASE_URL || "http://localhost:8000/";

axios.defaults.headers.post["Content-Type"] = "application/json";

export const axiosRequest = async (method, url, body) => {
  try {
    const resp = await axios({
      method: method,
      url: url,
      // add json body for post request
      ...(body &&
        method !== "get" && {
          data: JSON.stringify(body),
        }),
    });
    return [resp.data, null];
  } catch (err) {
    console.log(err);
    return [null, err];
  }
};
