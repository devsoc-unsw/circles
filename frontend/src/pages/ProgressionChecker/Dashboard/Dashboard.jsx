import React from "react";
import { useSelector } from "react-redux";
import { scroller } from "react-scroll";
import { ArrowDownOutlined } from "@ant-design/icons";
import { animated, useSpring } from "@react-spring/web";
import { Button, Typography } from "antd";
import LiquidProgressChart from "components/LiquidProgressChart";
import DegreeCard from "../DegreeCard";
import SkeletonDashboard from "./SkeletonDashboard";
import "./index.less";

const Dashboard = ({ storeUOC, isLoading, structure }) => {
  const { Title } = Typography;
  const currYear = new Date().getFullYear();

  const props = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    reset: true,
    config: { tension: 80, friction: 60 },
  });

  let calTotalUOC = 0;
  let calCompletedUOC = 0;
  Object.keys(storeUOC).forEach((group) => {
    calTotalUOC += storeUOC[group].total;
    calCompletedUOC += storeUOC[group].curr;
  });

  const clickArrow = () => {
    scroller.scrollTo("divider", {
      duration: 1500,
      smooth: true,
    });
  };

  const { programCode, programName } = useSelector((state) => state.degree);

  return (
    <div className="container">
      {isLoading ? (
        <SkeletonDashboard />
      ) : (
        <animated.div className="centered" style={props}>
          <LiquidProgressChart
            completedUOC={calCompletedUOC}
            totalUOC={calTotalUOC}
          />
          <a
            href={`https://www.handbook.unsw.edu.au/undergraduate/programs/${currYear}/${programCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="textLink"
          >
            <Title className="text textLink">{programCode} - {programName}</Title>
          </a>
          <div className="cards">
            {Object.entries(structure)
              .filter(([group]) => group !== "Rules")
              .map(([group, specialisation]) => (
                <DegreeCard
                  key={group}
                  type={group}
                  totalUOC={storeUOC[group].total}
                  currUOC={storeUOC[group].curr}
                  specialisation={specialisation}
                />
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
