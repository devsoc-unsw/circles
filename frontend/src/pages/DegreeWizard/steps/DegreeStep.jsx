import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Menu, Typography, Button,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useSpring, animated } from "@react-spring/web";
import "./steps.less";
import springProps from "../spring";
import { setProgram } from "../../../reducers/degreeSlice";

const { Title } = Typography;
const DegreeStep = ({ incrementStep, currStep }) => {
  const dispatch = useDispatch();
  const programCode = useSelector((store) => store.degree.programCode);
  const [options, setOptions] = useState(null);

  const fetchAllDegrees = async () => {
    const res = await axios.get("/programs/getPrograms");
    setOptions(res.data.programs);
  };

  useEffect(() => {
    fetchAllDegrees();
  }, []);

  const handleDegreeChange = (e) => {
    dispatch(
      setProgram({ programCode: e.key, programName: options[e.key] }),
    );
  };

  const props = useSpring(springProps);

  return (
    <animated.div style={props}>
      <div className="steps-heading-container">
        <Title level={4} className="text">
          What are you studying?
        </Title>
        {programCode && currStep === 2 && (
          <Button type="primary" onClick={incrementStep}>
            Next
          </Button>
        )}
      </div>

      {options && (
        <Menu
          className="degree-search-results"
          onClick={handleDegreeChange}
          selectedKeys={programCode && [programCode]}
          mode="inline"
        >
          {Object.keys(options).map((key) => (
            <Menu.Item className="text" key={key}>
              {key} &nbsp; {options[key]}
            </Menu.Item>
          ))}
        </Menu>
      )}
    </animated.div>
  );
};

export default DegreeStep;
