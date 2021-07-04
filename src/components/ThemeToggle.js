import React, { useState } from "react";
import { Switch } from "antd";
import { IoMdMoon } from "react-icons/io";
import { FaSun } from "react-icons/fa";

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const theme = window.localStorage.getItem("theme");
    return theme ? JSON.parse(theme) : "light";
  });

  React.useEffect(() => {
    window.localStorage.setItem("theme", JSON.stringify(theme));
    if (theme === "light") {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
    }
  }, [theme]);

  return (
    <Switch
      checkedChildren={<IoMdMoon display="flex" />}
      unCheckedChildren={<FaSun display="flex" />}
      defaultChecked={theme === "dark" ? true : false}
      onChange={() => setTheme(theme === "light" ? "dark" : "light")}
    />
  );
}

export default ThemeToggle;
