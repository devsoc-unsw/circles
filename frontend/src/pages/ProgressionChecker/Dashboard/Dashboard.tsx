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
import { ProgramStructure } from "types/structure";

type Props = {
  storeUOC: any
  isLoading: boolean
  structure: ProgramStructure
  uoc: number
};

const Dashboard = ({
  storeUOC, isLoading, structure, uoc,
}: Props) => {
  const { Title } = Typography;
  const currYear = new Date().getFullYear();

  const props = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    reset: true,
    config: { tension: 80, friction: 60 },
  });

  const { courses } = useSelector((state) => state.planner);

  const courseList = (
    Object.values(structure)
      .flatMap((specialisation) => Object.values(specialisation.content)
        .filter((spec) => typeof spec === "object" && spec.courses && !spec.type.includes("rule"))
        .flatMap((spec) => Object.keys(spec.courses)))
  );

  let completedUOC = 0;
  Object.keys(courses).forEach((courseCode) => {
    if (courseList.includes(courseCode)) completedUOC += courses[courseCode].UOC;
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
            completedUOC={completedUOC}
            totalUOC={uoc}
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
