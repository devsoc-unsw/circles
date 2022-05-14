/* eslint-disable */
import React, { useState } from "react";
import { Typography , PageHeader , Input } from "antd";

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
          title="EditMarks"
          subTitle={courseCode}
        />
      </div>
      <Input
        placeholder="Enter Mark"
      />
      <div className="edit-mark-buttons">

      </div>
    </div>
  );
};

export default EditMarks;
