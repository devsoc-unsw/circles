import React, { useState } from "react";
import { ArrowDownOutlined } from "@ant-design/icons";
import { animated, useSpring } from "@react-spring/web";
import { Button, Typography } from "antd";
import LiquidProgressChart from "components/LiquidProgressChart";
import DegreeCard from "../DegreeCard";
import SkeletonDashboard from "./SkeletonDashboard";
import "./index.less";

const Dashboard = ({ isLoading, degree }) => {
  const { Title } = Typography;
  const currYear = new Date().getFullYear();
  const [arrowButton, setarrowButton] = useState(true);

  const props = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    reset: true,
    config: { tension: 80, friction: 60 },
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY > 75) {
      setarrowButton(false);
    }
  });

  const clickArrow = () => {
    window.scrollTo({
      top: 757,
      behavior: "smooth",
    });
    setarrowButton(false);
  };

  return (
    <div className="container">
      {isLoading ? (
        <SkeletonDashboard />
      ) : (
        <animated.div className="centered" style={props}>
          <LiquidProgressChart
            completedUOC={degree.completed_UOC}
            totalUOC={degree.UOC}
          />
          <a
            href={`https://www.handbook.unsw.edu.au/undergraduate/programs/${currYear}/${degree.code}?year=${currYear}`}
            target="_blank"
            rel="noopener noreferrer"
            className="textLink"
          >
            <Title className="text textLink">{degree.name}</Title>
          </a>
          <div className="cards">
            {degree.concentrations
              && degree.concentrations.map((concentration, index) => (
                <DegreeCard key={index} concentration={concentration} />
              ))}
          </div>
          { arrowButton && (
            <Button
              className="arrowBtn"
              type="primary"
              shape="circle"
              icon={<ArrowDownOutlined />}
              onClick={clickArrow}
            />
          )}
        </animated.div>
      )}
    </div>
  );
};

export default Dashboard;
