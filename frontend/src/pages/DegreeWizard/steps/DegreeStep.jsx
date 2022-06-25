import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { animated, useSpring } from "@react-spring/web";
import {
  Input, Menu, Typography,
} from "antd";
import axios from "axios";
import { resetDegree, setProgram } from "reducers/degreeSlice";
import springProps from "./spring";
import "./steps.less";

const { Title } = Typography;

const DegreeStep = ({ incrementStep, currStep }) => {
  const dispatch = useDispatch();
  const programCode = useSelector((store) => store.degree.programCode);
  const [input, setInput] = useState("");
  const [options, setOptions] = useState(null);

  const fetchAllDegrees = async () => {
    const res = await axios.get("/programs/getPrograms");
    setOptions(res.data.programs);
    console.log(res.data);
  };
  useEffect(() => {
    fetchAllDegrees();
  }, []);

  const handleDegreeChange = (e) => {
    dispatch(resetDegree()); // reset degree to reset state of spec
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
        {programCode && currStep === 2 && dispatch(incrementStep)}
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
