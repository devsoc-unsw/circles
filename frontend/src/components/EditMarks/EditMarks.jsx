/* eslint-disable */
import React, { useState } from "react";
import { Typography , PageHeader } from "antd";

import "./index.less";

const EditMarks = ({ courseCode, courseTitle, handleCancelEditMark }) => {

  const courseDescriptor = (courseTitle.length > 33) ?
    courseTitle.slice(0, 30) + "..." : courseTitle;

  return (
    <div className="edit-mark">
      <div className="edit-mark-head">
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
