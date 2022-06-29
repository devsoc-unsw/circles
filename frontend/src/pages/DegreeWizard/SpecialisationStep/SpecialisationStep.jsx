import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { animated, useSpring } from "@react-spring/web";
import { Button, Menu, Typography } from "antd";
import axios from "axios";
import { addSpecialisation, removeSpecialisation } from "reducers/degreeSlice";
import springProps from "../common/spring";
import CS from "../common/styles";

const { Title } = Typography;

const SpecialisationStep = ({ incrementStep, currStep, type }) => {
  const props = useSpring(springProps);
  const dispatch = useDispatch();
  const { programCode, specs } = useSelector((store) => store.degree);
  const [options, setOptions] = useState({ someProgramName: { specs: { major: "major data" }, notes: "a note" } });

  const fetchAllSpecialisations = useCallback(async () => {
    const res = await axios.get(`/specialisations/getSpecialisations/${programCode}/${type}`);
    setOptions(res.data.spec);
  }, [programCode, type]);

  useEffect(() => {
    if (programCode !== "") fetchAllSpecialisations();
  }, [fetchAllSpecialisations, programCode, type]);

  return (
    <CS.StepContentWrapper id={type}>
      <animated.div style={props}>
        <CS.StepHeadingWrapper>
          <Title level={4} className="text">
            What are your {type}?
          </Title>
          {currStep && (
          <Button type="primary" onClick={() => incrementStep()}>
            Next
          </Button>
          )}
        </CS.StepHeadingWrapper>
        <Menu
          onSelect={(e) => dispatch(addSpecialisation(e.key))}
          onDeselect={(e) => dispatch(removeSpecialisation(e.key))}
          selectedKeys={specs}
          defaultOpenKeys={["0"]}
          mode="inline"
          style={{
            gap: "10px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {Object.keys(options).map((sub, index) => (
            <Menu.SubMenu
              key={index}
              title={`${type.replace(/^\w/, (c) => c.toUpperCase())} for ${sub}`}
              mode="inline"
              style={{
                border: "1px solid #a86fed",
              }}
            >
              {(options[sub].notes)
                ? (
                  <Menu.ItemGroup type="group" title={`Note: ${options[sub].notes}`}>
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
    </CS.StepContentWrapper>
  );
};

export default SpecialisationStep;
