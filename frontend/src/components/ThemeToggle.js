import React, { useState } from "react";
import { Switch } from "antd";
import { IoMdMoon } from "react-icons/io";
import { useDispatch } from "react-redux";
import { toggleTheme } from "../actions/toggleTheme";

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const theme = window.localStorage.getItem("theme");
    return theme ? JSON.parse(theme) : "light";
  });

  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(toggleTheme(theme));
    if (theme === "light") {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
    }
  }, [theme]);

  const toggleStyle = {
    backgroundColor: theme === "light" ? "#b37feb" : "#722ed1",
  };

  return (
    <Switch
      checkedChildren={<IoMdMoon display="flex" />}
      unCheckedChildren={<IoMdMoon display="flex" />}
      defaultChecked={theme === "dark" ? true : false}
      onChange={() => setTheme(theme === "light" ? "dark" : "light")}
      style={toggleStyle}
    />
  );
}

export default ThemeToggle;
