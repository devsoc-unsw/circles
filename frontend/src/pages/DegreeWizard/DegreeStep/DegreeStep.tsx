import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { animated, useSpring } from "@react-spring/web";
import {
  Input, Menu, Typography,
} from "antd";
import axios from "axios";
import { RootState } from "config/store";
import { resetDegree, setProgram } from "reducers/degreeSlice";
import springProps from "../common/spring";
import STEPS from "../common/steps";
import CS from "../common/styles";

const { Title } = Typography;

type Props = {
  incrementStep: (stepTo?: STEPS) => void
};

const DegreeStep = ({ incrementStep }: Props) => {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState([]);
  const [allDegrees, setAllDegrees] = useState({});

  const dispatch = useDispatch();
  const programCode = useSelector((store: RootState) => store.degree.programCode);

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

    if (e.key) incrementStep(STEPS.SPECS);
  };

  const searchDegree = (newInput: string) => {
    setInput(newInput);
    const fullDegreeName = Object.keys(allDegrees).map((code) => `${code} ${allDegrees[code]}`);
    setOptions(
      fullDegreeName
        .filter((degree) => degree.toLowerCase().includes(newInput.toLowerCase()))
        // splice to only show max 8 options
        .splice(0, 8),
    );
  };

  const props = useSpring(springProps);

  const items = options.map((degreeName) => ({
    label: degreeName,
    key: degreeName,
  }));

  return (
    <CS.StepContentWrapper id="degree">
      <animated.div style={props}>
        <Title level={4} className="text">
          What are you studying?
        </Title>
        <Input
          size="large"
          type="text"
          value={input}
          placeholder="Search Degree"
          onChange={(e) => (searchDegree(e.target.value))}
        />
        {input && options && (
          <Menu
            onClick={handleDegreeChange}
            selectedKeys={programCode && [programCode]}
            items={items}
            mode="inline"
          />
        )}
      </animated.div>
    </CS.StepContentWrapper>
  );
};

export default DegreeStep;
