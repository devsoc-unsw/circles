import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Menu, Button, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import "./steps.less";
import { useSpring, animated } from "@react-spring/web";
import springProps from "./spring";
import { addMinor, removeMinor } from "../../../reducers/degreeSlice";

const { Title } = Typography;
const MinorStep = ({ incrementStep, currStep }) => {
  const dispatch = useDispatch();
  const { minors, programCode } = useSelector((store) => store.degree);
  const [options, setOptions] = useState({ someProgramName: { specs: { major: "major data etc" } } });

  const fetchAllMinors = useCallback(async () => {
    const res = await axios.get(`/programs/getMinors/${programCode}`);
    setOptions(res.data.minors);
  }, [programCode]);

  useEffect(() => {
    if (programCode !== "") fetchAllMinors();
  }, [fetchAllMinors, programCode]);

  const props = useSpring(springProps);

  return (
    <animated.div style={props} className="steps-root-container">
      <div className="steps-heading-container">
        <Title level={4} className="text">
          What is your minor (if any)?
        </Title>
        {currStep === 4 && (
          <Button
            onClick={incrementStep}
            type="primary"
            className="steps-next-btn"
          >
            Next
          </Button>
        )}
      </div>

      <Menu
        className="degree-minors"
        selectedKeys={minors}
        mode="inline"
        onDeselect={(e) => dispatch(removeMinor(e.key))}
        onSelect={(e) => dispatch(addMinor(e.key))}
        defaultOpenKeys={["0"]}
      >
        {Object.keys(options).map((sub, index) => (
          <Menu.SubMenu
            key={index}
            title={`Minors for ${sub}`}
            className="step-submenu"
            mode="inline"
          >
            {Object.keys(options[sub].specs).map((key) => (
              <Menu.Item className="text" key={key}>
                {key} {options[sub].specs[key]}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        ))}
      </Menu>
    </animated.div>
  );
};
export default MinorStep;
