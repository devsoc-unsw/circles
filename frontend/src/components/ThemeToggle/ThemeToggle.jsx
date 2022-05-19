import React, { useEffect, useState } from "react";
import { Switch } from "antd";
import { IoMdMoon, IoIosSunny } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../reducers/themeSlice";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(useSelector((state) => state.theme));
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(toggleTheme(theme));
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
