import React from "react";
import { Card, Progress, Typography } from "antd";
import ReactTooltip from "react-tooltip";
import { purple } from "@ant-design/colors";
import { Link } from "react-scroll";

const DegreeComponentCard = ({ title, subTitle, completedUOC, totalUOC }) => {
  const { Title, Text } = Typography;
  const progress = Math.round((completedUOC / totalUOC) * 100);
  return (
    <Link to={title} smooth={true} duration={1000}>
      <Card className="card text" hoverable bordered={false}>
        <Title className="text" level={5}>
          {title}
        </Title>
        <Text className="secondaryText">{subTitle}</Text>
        <div data-tip data-for={subTitle}>
          <Progress
            percent={progress}
            trailColor="white"
            showInfo={false}
            strokeColor={{ "0%": purple[3], "100%": purple[4] }}
          />
        </div>
        <ReactTooltip id={subTitle} place="bottom" className="tooltip">
          <div>{progress}%</div>
          <div>
            ({completedUOC}/{totalUOC} UOC)
          </div>
        </ReactTooltip>
      </Card>
    </Link>
  );
};

export default DegreeComponentCard;
