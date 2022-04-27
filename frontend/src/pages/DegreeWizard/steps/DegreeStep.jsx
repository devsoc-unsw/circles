import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Menu, Typography, Button, Input,
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
  const [input, setInput] = useState("");
  const [options, setOptions] = useState(null);

  const fetchAllDegrees = async () => {
    const res = await axios.get("/programs/getPrograms");
    setOptions(res.data.programs);
  };

  useEffect(() => {
    fetchAllDegrees();
  }, []);

  const handleDegreeChange = (e) => {
    setInput(options[e.key]);
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

      <Input
        size="large"
        type="text"
        value={input}
        placeholder="Search Degree"
        onChange={(e) => setInput(e.target.value)}
      />
      {input !== "" && options && (
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
