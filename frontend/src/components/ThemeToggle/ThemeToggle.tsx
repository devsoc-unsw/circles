import React from "react";
import { IoIosSunny, IoMdMoon } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { Switch } from "antd";
import { RootState } from "config/store";
import { toggleTheme } from "reducers/settingsSlice";

const ThemeToggle = () => {
  const { theme } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const toggleStyle = {
    backgroundColor: theme === "light" ? "#b37feb" : "#722ed1",
  };

  return (
    <Switch
      checkedChildren={<IoMdMoon display="flex" />}
      unCheckedChildren={<IoIosSunny display="flex" />}
      defaultChecked={theme === "dark"}
      onChange={() => dispatch(toggleTheme(theme === "light" ? "dark" : "light"))}
      style={toggleStyle}
    />
  );
};

export default ThemeToggle;
