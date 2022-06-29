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
  const [options, setOptions] = useState([]);
  const [allDegrees, setAllDegrees] = useState({});
  const fetchAllDegrees = async () => {
    const res = await axios.get("/programs/getPrograms");
    setAllDegrees(res.data.programs);
  };

  useEffect(() => {
    fetchAllDegrees();
  }, []);

  const handleDegreeChange = (e) => {
    dispatch(resetDegree());
    dispatch(
      setProgram({ programCode: e.key.substring(0, 4), programName: e.key.substring(5) }),
    );
    setInput(e.key);
    setOptions([]);
  };

  const searchDegree = (newInput) => {
    setInput(newInput);
    if (newInput) {
      const fullDegreeName = Object.keys(allDegrees).map((code) => `${code} ${allDegrees[code]}`);
      setOptions(
        fullDegreeName.filter((degree) => degree.toLowerCase().includes(newInput.toLowerCase())),
      );
    } else {
      setOptions([]);
    }
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
        onChange={(e) => (searchDegree(e.target.value))}
      />
      {input && options && (
        <Menu
          className="degree-search-results"
          onClick={handleDegreeChange}
          selectedKeys={programCode && [programCode]}
          mode="inline"
        >
          {options.map((degreeName) => (
            <Menu.Item className="text" key={degreeName}>
              {degreeName}
            </Menu.Item>
          ))}
        </Menu>
      )}
    </animated.div>
  );
};

export default DegreeStep;
