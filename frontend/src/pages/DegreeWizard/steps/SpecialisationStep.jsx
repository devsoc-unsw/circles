import React, { useEffect } from "react";
import axios from "axios";
import { Menu, Button, Typography } from "antd";
import { Link } from "react-scroll";
import { degreeActions } from "../../../actions/degreeActions";
import { useDispatch, useSelector } from "react-redux";
import "./steps.less";

const { Title } = Typography;
export const SpecialisationStep = () => {
  const dispatch = useDispatch();
  const { programCode, specialisation } = useSelector((store) => store.degree);
  const [selected, setSelected] = React.useState("Select Specialisation");
  const [options, setOptions] = React.useState({
    1: "major",
    2: "major",
    3: "major",
    4: "major",
    5: "major",
  });

  const fetchAllSpecializations = async () => {
    const res = await axios.get(
      `http://localhost:8000/programs/getMajors/${programCode}`
    );
    console.log(res.data);
    setOptions(res.data["majors"]);
    // setIsLoading(false);
  };

  useEffect(() => {
    // setTimeout(fetchDegree, 2000); // testing skeleton
    fetchAllSpecializations();
  }, [programCode]);

  return (
    <div className="steps-root-container">
      <Title level={3} className="text">
        What are you specialising in?
      </Title>
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
      {specialisation !== null && (
        <Link to="Minor" smooth={true} duration={1000}>
          <Button className="steps-next-btn" type="primary">
            Next
          </Button>
        </Link>
      )}
    </div>
  );
};
