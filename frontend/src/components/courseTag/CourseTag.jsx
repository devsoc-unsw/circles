import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import { Tag } from 'antd';
import ReactTooltip from "react-tooltip";
import './courseTag.less';

// NOTE: Tooltip not working
export const CourseTag = ({ name }) => {
  const history = useHistory();
  const handleClick = () => {
    history.push(`/course-selector/${name}`);
  }

  // dark mode always has white text
  const theme = useSelector((state) => state.theme);
  return (
      <Tag onClick={handleClick} className={'text tag'}>
        <ReactTooltip place="bottom" type={theme === "dark" && "light"}>
          See more
        </ReactTooltip>
        { name }
      </Tag>
  );
}
