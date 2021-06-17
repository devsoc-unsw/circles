import React from "react";
import { Switch } from "antd";
import { IoMdMoon } from "react-icons/io";
import { FaSun } from "react-icons/fa";

function ThemeToggle() {
  const [theme, setTheme] = React.useState("dark");
  const changeTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  React.useEffect(() => {
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
      checkedChildren={
        <IoMdMoon
          style={{
            display: "flex",
          }}
        />
      }
      unCheckedChildren={
        <FaSun
          style={{
            display: "flex",
          }}
        />
      }
      defaultChecked
      onChange={changeTheme}
    />
  );
}

export default ThemeToggle;
