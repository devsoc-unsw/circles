import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-scroll";
import ReactTooltip from "react-tooltip";
import { purple } from "@ant-design/colors";
import { Progress, Typography } from "antd";
import S from "./styles";

const DegreeCard = ({
  type, totalUOC, currUOC, specialisation,
}) => {
  const { Title, Text } = Typography;
  const progress = Math.min(Math.round((currUOC / totalUOC) * 100), 100);

  const { theme } = useSelector((state) => state.settings);

  return (
    <Link to={type} smooth duration={2000}>
      <S.Card hoverable bordered={false}>
        <Title className="text" level={5}>
          {specialisation.name || type}
        </Title>
        <Text className="secondaryText">{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
        <div data-tip data-for={`card-${type}`}>
          <Progress
            percent={progress}
            trailColor="white"
            showInfo={false}
            strokeColor={{ "0%": purple[3], "100%": purple[4] }}
          />
        </div>
        <ReactTooltip
          id={`card-${type}`}
          place="bottom"
          type={theme === "dark" && "light"}
        >
          <S.TooltipText>
            <div>{progress}%</div>
            <div>({currUOC} / {totalUOC} UOC)</div>
          </S.TooltipText>
        </ReactTooltip>
      </S.Card>
    </Link>
  );
};

export default DegreeCard;
