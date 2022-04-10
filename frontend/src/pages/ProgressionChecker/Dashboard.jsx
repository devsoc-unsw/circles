import React from "react";
import { Typography } from "antd";
import { useSpring, animated } from "react-spring";
import DegreeCard from "./DegreeCard";
import SkeletonDashboard from "./SkeletonDashboard";
import LiquidProgressChart from "../../components/liquidProgressChart/LiquidProgressChart";

const Dashboard = ({ isLoading, degree }) => {
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
        </animated.div>
      )}
    </div>
  );
};

export default Dashboard;
