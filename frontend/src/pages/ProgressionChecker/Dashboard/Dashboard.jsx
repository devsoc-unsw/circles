import React from "react";
import { scroller } from "react-scroll";
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
  const props = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    reset: true,
    config: { tension: 80, friction: 60 },
  });

  const clickArrow = () => {
    scroller.scrollTo("divider", {
      duration: 1500,
      smooth: true,
    });
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
          <Button
            className="arrowBtn"
            type="primary"
            shape="circle"
            icon={<ArrowDownOutlined />}
            onClick={clickArrow}
          />
        </animated.div>
      )}
    </div>
  );
};

export default Dashboard;
