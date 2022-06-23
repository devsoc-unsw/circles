import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { animated, useSpring } from "@react-spring/web";
import { Button, Menu, Typography } from "antd";
import axios from "axios";
import { addSpecialisation, removeSpecialisation } from "reducers/degreeSlice";
import springProps from "./spring";
import "./steps.less";

const { Title } = Typography;
const SpecialisationStep = ({ incrementStep, isCurrentStep, type }) => {
  const dispatch = useDispatch();
  const { programCode, specs } = useSelector((store) => store.degree);
  const [options, setOptions] = useState({ someProgramName: { specs: { major: "major data" } } });

  const fetchAllSpecialisations = useCallback(async () => {
    const res = await axios.get(`/specialisations/getSpecialisations/${programCode}/${type}`);
    setOptions(res.data.spec);
  }, [programCode, type]);

  useEffect(() => {
    if (programCode !== "") fetchAllSpecialisations();
  }, [fetchAllSpecialisations, programCode, type]);

  const props = useSpring(springProps);
  return (
    <animated.div style={props} className="steps-root-container">
      <div className="steps-heading-container">
        <Title level={4} className="text">
          What are your {type}?
        </Title>
        {isCurrentStep && (
          <Button type="primary" onClick={incrementStep}>
            Next
          </Button>
        )}
      </div>

      <Menu
        className="degree-specialisations"
        onSelect={(e) => dispatch(addSpecialisation(e.key))}
        onDeselect={(e) => dispatch(removeSpecialisation(e.key))}
        selectedKeys={specs}
        defaultOpenKeys={["0"]}
        mode="inline"
      >
        {Object.keys(options).map((sub, index) => (
          <Menu.SubMenu
            key={index}
            title={`${type.replace(/^\w/, (c) => c.toUpperCase())} for ${sub}`}
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

export default SpecialisationStep;
