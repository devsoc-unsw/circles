/* eslint-disable */
import React from "react";
import { FaWindowClose } from "react-icons/fa";
import { Typography } from "antd";

const EditMark = ({ code, x, y }) => {
  const { Text } = Typography;

  const closeWindow = (e) => {
    e.target.style.color = "red";
    e.target.parentElement.parentElement.style.display = "none";
  };

  return (
    <div className="EditMark-cont">
      <div className="EditMark-header">
        <Text Strong>
          Edit Mark
        </Text>
        <FaWindowClose onClick={closeWindow} />
      </div>
    </div>
  );
};

export default EditMark;
