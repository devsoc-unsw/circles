import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Menu, Button, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import "./steps.less";
import { useSpring, animated } from "@react-spring/web";
import springProps from "../spring";
import { setSpecialisation } from "../../../reducers/degreeSlice";

const { Title } = Typography;
const SpecialisationStep = ({ incrementStep, currStep }) => {
  const dispatch = useDispatch();
  const { programCode, specialisation } = useSelector((store) => store.degree);
  const [options, setOptions] = useState({
    1: "major",
  });

  onkeyup = (e) => {
    if (specialisation && e.key === "Enter") {
      incrementStep();
    }
  };

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
          What are you specialising in?
        </Title>
        {specialisation && currStep === 3 && (
          <Button type="primary" onClick={incrementStep}>
            Next
          </Button>
        )}
      </div>

      <Menu
        className="degree-specialisations"
        onSelect={(e) => dispatch(setSpecialisation(e.key))}
        onDeselect={() => dispatch(setSpecialisation(""))}
        selectedKeys={specialisation && [specialisation]}
        mode="inline"
      >
        {programCode ? (
          Object.keys(options).map((key) => (
            <Menu.Item className="text" key={key}>
              {key} {options[key]}
            </Menu.Item>
          ))
        ) : (
          <div>Please select a degree first...</div>
        )}
      </Menu>
    </animated.div>
  );
};

export default SpecialisationStep;
