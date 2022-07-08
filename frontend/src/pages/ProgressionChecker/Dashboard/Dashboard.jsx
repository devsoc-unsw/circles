import React from "react";
import { useSelector } from "react-redux";
import { scroller } from "react-scroll";
import { ArrowDownOutlined } from "@ant-design/icons";
import { useSpring } from "@react-spring/web";
import { Button, Typography } from "antd";
import LiquidProgressChart from "components/LiquidProgressChart";
import DegreeCard from "../DegreeCard";
import SkeletonDashboard from "./SkeletonDashboard";
import S from "./styles";

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
    // Math min to handle overflow of courses
    calCompletedUOC += Math.min(storeUOC[group].curr, storeUOC[group].total);
  });

  const handleClick = () => {
    scroller.scrollTo("divider", {
      duration: 1500,
      smooth: true,
    });
  };

  const { programCode, programName } = useSelector((state) => state.degree);

  return (
    <S.Wrapper>
      {isLoading ? (
        <SkeletonDashboard />
      ) : (
        <S.ContentWrapper style={props}>
          <LiquidProgressChart
            completedUOC={calCompletedUOC}
            totalUOC={calTotalUOC}
          />
          <a
            href={`https://www.handbook.unsw.edu.au/undergraduate/programs/${currYear}/${programCode}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Title className="text">{programCode} - {programName}</Title>
          </a>
          <S.CardsWrapper>
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
          </S.CardsWrapper>
          <Button
            type="primary"
            shape="circle"
            icon={<ArrowDownOutlined />}
            onClick={handleClick}
          />
        </S.ContentWrapper>
      )}
    </S.Wrapper>
  );
};

export default Dashboard;
