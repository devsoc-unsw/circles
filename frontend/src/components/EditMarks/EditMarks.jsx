/* eslint-disable */
import React, { useState } from "react";
import { Typography , PageHeader } from "antd";

import ".index.less";

const EditMarks = ({ courseCode, courseTitle, handleCancelEditMark }) => {

  // const { Text, Title } = Typography;

  return (
    <div className="edit-mark">
      <div className="edit-mark-head">
        PAGEHEADER!!!!!
        <PageHeader
          className="site-page-header"
          onBack={() => null}
          title={courseCode}
          subTitle={courseTitle}
        />
      </div>
    </div>
  );
};

export default EditMarks;
