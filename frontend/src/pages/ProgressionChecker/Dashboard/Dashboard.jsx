import React from "react";
import { animated, useSpring } from "@react-spring/web";
import { Typography } from "antd";
import LiquidProgressChart from "components/LiquidProgressChart";
import DegreeCard from "../DegreeCard";
import SkeletonDashboard from "./SkeletonDashboard";
import "./index.less";

const Dashboard = ({ storeUoc, isLoading, degree }) => {
  const { Title } = Typography;
  const currYear = new Date().getFullYear();

  const props = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    reset: true,
    config: { tension: 80, friction: 60 },
  });

  return (
    <div className="container">
      {isLoading ? (
        <SkeletonDashboard />
      ) : (
        <animated.div className="centered" style={props}>
          <LiquidProgressChart
            completedUOC={storeUoc.completed_UOC}
            totalUOC={storeUoc.total_UOC}
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
            {Object.entries(degree).map(([i, obj], index) => {
              if (i === "General") return null;
              obj.total_UOC = storeUoc[i].total_UOC;
              obj.completed_UOC = storeUoc[i].completed_UOC;
              return (
                <DegreeCard index={index} type={i} concentration={obj} />
              );
            })}
          </div>
        </animated.div>
      )}
    </div>
  );
};

export default Dashboard;
