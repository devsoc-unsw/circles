import React from "react";
import { Card, Progress, Typography } from "antd";
import ReactTooltip from "react-tooltip";
import { purple } from "@ant-design/colors";
import { Link } from "react-scroll";
import { useSelector } from "react-redux";

const DegreeCard = ({ concentration }) => {
  const { Title, Text } = Typography;
  const { name, type, completed_UOC, UOC } = concentration;

  const progress = Math.round((completed_UOC / UOC) * 100);

  const theme = useSelector((state) => state.theme);

  return (
    <Link to={name} smooth={true} duration={1000}>
      <Card className="card text" hoverable bordered={false}>
        <Title className="text" level={5}>
          {name}
        </Title>
        <Text className="secondaryText">{type.charAt(0).toUpperCase()+type.slice(1)}</Text>
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
            ({completed_UOC} / {UOC} UOC)
          </div>
        </ReactTooltip>
      </Card>
    </Link>
  );
};

export default DegreeCard;
