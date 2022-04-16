import React, { useEffect, useState } from "react";
import { Switch } from "antd";
import { IoMdMoon, IoIosSunny } from "react-icons/io";
import { useDispatch } from "react-redux";
import toggleTheme from "../actions/toggleTheme";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    const t = window.localStorage.getItem("theme");
    return t ? JSON.parse(theme) : "light";
  });
  const dispatch = useDispatch();

  useEffect(() => {
    window.localStorage.setItem("theme", JSON.stringify(theme));
    dispatch(toggleTheme(theme));
    if (theme === "light") {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
    }
  }, [theme, dispatch]);

  const toggleStyle = {
    backgroundColor: theme === "light" ? "#b37feb" : "#722ed1",
  };

  return (
    // Disabled because too many dark features are not adjusted
    <Switch
      checkedChildren={<IoMdMoon display="flex" />}
      unCheckedChildren={<IoIosSunny display="flex" />}
      defaultChecked={theme === "dark"}
      onChange={() => setTheme(theme === "light" ? "dark" : "light")}
      style={toggleStyle}
    />
  );
};

export default ThemeToggle;
