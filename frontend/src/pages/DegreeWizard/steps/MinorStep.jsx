import React, { useEffect } from "react";
import axios from "axios";
import { Menu, Button, Typography } from "antd";
import { degreeActions } from "../../../actions/degreeActions";
import { useDispatch, useSelector } from "react-redux";
import "./steps.less";
import { useSpring, animated } from "react-spring";
import { springProps } from "../spring";

const { Title } = Typography;
export const MinorStep = ({ incrementStep, currStep }) => {
  const dispatch = useDispatch();
  const { minor, programCode } = useSelector((store) => store.degree);
  const [options, setOptions] = React.useState({});

  const fetchAllMinors = async () => {
    const res = await axios.get(`/programs/getMinors/${programCode}`);
    setOptions(res.data["minors"]);
  };

  useEffect(() => {
    if (programCode !== "") fetchAllMinors();
  });

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
        onClick={(e) => dispatch(degreeActions("SET_MINOR", e.key))}
        selectedKeys={minor && [minor]}
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
