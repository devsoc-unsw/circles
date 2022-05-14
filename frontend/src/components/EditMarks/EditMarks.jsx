/* eslint-disable */
import React, { useState } from "react";
import { Typography , PageHeader } from "antd";

const EditMark = ({ courseCode, courseTitle }) => {

  const { Text, Title } = Typography;
  // Fetch courseMark from State
  
  const isSmall = media("(max-width: 1000px)");

  // ? Move to parent?
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const confirmUpdate= () => {
    // Validate input
    // If bad input - get something from popconfirm

    // Update state
    setIsModalVisible(false);
  }

  const courseDescriptor = (isSmall) ?
    `${courseCode}` : `${courseCode}: ${courseTitle}`;

  return (
    <div className="edit-mark">
      <div className="edit-mark-head">
        <PageHeader
          className="site-page-header"
          onBack={() => null}
          title={courseCode}
          subtitle={courseTitle}
        />
      </div>
      <div>

      </div>
    </div>
  );
};

export default EditMark;
