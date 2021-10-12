export const toggleTheme = (payload) => {
  console.log(payload);
  return {
    type: "toggleTheme",
    payload: payload,
  };
};
