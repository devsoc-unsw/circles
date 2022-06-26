import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-scroll";
import ReactTooltip from "react-tooltip";
import { purple } from "@ant-design/colors";
import { Card, Progress, Typography } from "antd";
import "./index.less";

const DegreeCard = ({ type, concentration }) => {
  const { Title, Text } = Typography;
  const progress = Math.round((concentration.completed_UOC / concentration.total_UOC) * 100);

  const theme = useSelector((state) => state.theme);

  return (
    <Link to={concentration.name} smooth duration={1000}>
      <Card className="card text" hoverable bordered={false}>
        <Title className="text" level={5}>
          {concentration.name}
        </Title>
        <Text className="secondaryText">{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
        <div data-tip data-for={type}>
          <Progress
            percent={progress}
            trailColor="white"
            showInfo={false}
            strokeColor={{ "0%": purple[3], "100%": purple[4] }}
          />
        </div>
        <ReactTooltip
          id={type}
          place="bottom"
          className="tooltip"
          type={theme === "dark" && "light"}
        >
          <div>{progress}%</div>
          <div>
            ({concentration.completed_UOC} / {concentration.total_UOC} UOC)
          </div>
        </ReactTooltip>
      </Card>
    </Link>
  );
};

export default DegreeCard;
