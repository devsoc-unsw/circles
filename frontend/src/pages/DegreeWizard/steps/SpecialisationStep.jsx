import React, { useEffect } from "react";
import axios from "axios";
import { Menu, Button, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import "./steps.less";
import { useSpring, animated } from "react-spring";
import springProps from "../spring";
import degreeActions from "../../../actions/degreeActions";

const { Title } = Typography;
const SpecialisationStep = ({ incrementStep, currStep }) => {
  const dispatch = useDispatch();
  const { programCode, specialisation } = useSelector((store) => store.degree);
  const [options, setOptions] = React.useState({
    1: "major",
  });

  const fetchAllSpecializations = async () => {
    const res = await axios.get(`/programs/getMajors/${programCode}`);
    setOptions(res.data.majors);
  };

  useEffect(() => {
    if (programCode !== "") fetchAllSpecializations();
  });

  const props = useSpring(springProps);

  return (
    <animated.div style={props} className="steps-root-container">
      <div className="steps-heading-container">
        <Title level={4} className="text">
          What are you specialising in?
        </Title>
        {specialisation !== null && currStep === 3 && (
          <Button type="primary" onClick={incrementStep}>
            Next
          </Button>
        )}
      </div>

      <Menu
        className="degree-specialisations"
        onClick={(e) => dispatch(degreeActions("SET_SPECIALISATION", e.key))}
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
