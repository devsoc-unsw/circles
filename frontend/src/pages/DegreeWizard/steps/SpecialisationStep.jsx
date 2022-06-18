import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { animated, useSpring } from "@react-spring/web";
import { Button, Menu, Typography } from "antd";
import axios from "axios";
import { addMajor, removeMajor } from "reducers/degreeSlice";
import springProps from "./spring";
import "./steps.less";

const { Title } = Typography;
const SpecialisationStep = ({ incrementStep, currStep }) => {
  const dispatch = useDispatch();
  const { programCode, majors } = useSelector((store) => store.degree);
  const [options, setOptions] = useState({ someProgramName: { specs: { major: "major data" }, notes: "note" } });

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
            {(options[sub].notes !== "")
              ? (
                <Menu.ItemGroup type="group" title={`(Note: ${options[sub].notes})`}>
                  {Object.keys(options[sub].specs).map((key) => (
                    <Menu.Item className="text" key={key}>
                      {key} {options[sub].specs[key]}
                    </Menu.Item>
                  ))}
                </Menu.ItemGroup>
              )
              : Object.keys(options[sub].specs).map((key) => (
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

export default SpecialisationStep;
