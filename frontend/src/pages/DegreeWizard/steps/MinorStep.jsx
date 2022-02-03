import React, { useEffect } from "react";
import axios from "axios";
import { Menu, Button, Typography } from "antd";
import { degreeActions } from "../../../actions/degreeActions";
import { Link } from "react-scroll";
import { useDispatch, useSelector } from "react-redux";
import "./steps.less";

const { Title } = Typography;
export const MinorStep = () => {
  const dispatch = useDispatch();
  const { minor, programCode } = useSelector((store) => store.degree);
  // Fetch the minors
  const [selected, setSelected] = React.useState("Select Minor");
  const [options, setOptions] = React.useState({});

  const fetchAllMinors = async () => {
    const res = await axios.get(
      `http://localhost:8000/programs/getMinors/${programCode}`
    );
    setOptions(res.data["minors"]);

    // setIsLoading(false);
  };

  useEffect(() => {
    fetchAllMinors();
  }, [programCode]);

  return (
    <div className="steps-root-container">
      <Title level={3} className="text">
        What is your minor (if any)?
      </Title>
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
          <div>Please select a degree first</div>
        )}
      </Menu>
      <Link to="Previous Courses" smooth={true} duration={1000}>
        <Button type="primary" className="steps-next-btn">
          Next
        </Button>
      </Link>
    </div>
  );
};
