import React from "react";
// import { Switch } from "antd";
// import { IoMdMoon, IoIosSunny } from "react-icons/io";
import { useDispatch } from "react-redux";
import { toggleTheme } from "../actions/toggleTheme";

function ThemeToggle() {
  // const [theme, setTheme] = useState(() => {
  //   const theme = window.localStorage.getItem("theme");
  //   return theme ? JSON.parse(theme) : "light";
  // });
  const theme = "light";
  const dispatch = useDispatch();

  React.useEffect(() => {
    window.localStorage.setItem("theme", JSON.stringify(theme));
    dispatch(toggleTheme("light"));
    if (theme === "light") {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
    }
  }, [theme, dispatch]);

  // const toggleStyle = {
  //   backgroundColor: theme === "light" ? "#b37feb" : "#722ed1",
  // };

  return (
    // Disabled because too many dark features are not adjusted
    <></>
    // <Switch
    //   checkedChildren={<IoMdMoon display="flex" />}
    //   unCheckedChildren={<IoIosSunny display="flex" />}
    //   defaultChecked={theme === "dark" ? true : false}
    //   onChange={() => setTheme(theme === "light" ? "dark" : "light")}
    //   style={toggleStyle}
    // />
  );
}

export default ThemeToggle;
