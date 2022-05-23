import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Menu, Button, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import "./steps.less";
import { useSpring, animated } from "@react-spring/web";
import springProps from "./spring";
import { addMajor, removeMajor } from "../../../reducers/degreeSlice";

const { Title } = Typography;
const SpecialisationStep = ({ incrementStep, currStep }) => {
  const dispatch = useDispatch();
  const { programCode, majors } = useSelector((store) => store.degree);
  const [options, setOptions] = useState({ 1: { 1: "major" } });

  const fetchAllSpecialisations = useCallback(async () => {
    const res = await axios.get(`/programs/getMajors/${programCode}`);
    setOptions(res.data.majors);
  }, [programCode]);

  useEffect(() => {
    if (programCode !== "") fetchAllSpecialisations();
  }, [fetchAllSpecialisations, programCode]);

  const props = useSpring(springProps);
  return (
    <animated.div style={props} className="steps-root-container">
      <div className="steps-heading-container">
        <Title level={4} className="text">
          What do you major in?
        </Title>
        {majors.length > 0 && currStep === 3 && (
          <Button type="primary" onClick={incrementStep}>
            Next
          </Button>
        )}
      </div>

      <Menu
        className="degree-specialisations"
        onSelect={(e) => dispatch(addMajor(e.key))}
        onDeselect={(e) => dispatch(removeMajor(e.key))}
        selectedKeys={majors}
        defaultOpenKeys={["0"]}
        mode="inline"
      >
        {Object.keys(options).map((sub, index) => (
          <Menu.SubMenu
            key={index}
            title={`Majors for ${sub}`}
            className="step-submenu"
            mode="inline"
          >
            {Object.keys(options[sub]).map((key) => (
              key !== "notes" && (
              <Menu.Item className="text" key={key}>
                {key} {options[sub][key]}
              </Menu.Item>
              )))}
          </Menu.SubMenu>
        ))}
      </Menu>
    </animated.div>
  );
};

export default SpecialisationStep;
