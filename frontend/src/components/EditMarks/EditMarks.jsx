/* eslint-disable */
import React, { useState } from "react";
import { Typography , PageHeader , Input , Button } from "antd";

import "./index.less";

const EditMarks = ({ courseCode, courseTitle, handleCancelEditMark }) => {

  const handleLetterGrade = (e) => {
    e.preventDefault();
    console.log("testing");
    // TODO - 
  }

  return (
    <div className="edit-mark">
      <div className="edit-mark-head">
      </div>
      <Input
        placeholder="Enter Mark"
      />
      <div className="letter-grade-container">
        <Button onClick={handleLetterGrade} classname="letter-grade-button">FL</Button>
        <Button onClick={handleLetterGrade} classname="letter-grade-button">PS</Button>
        <Button onClick={handleLetterGrade} classname="letter-grade-button">CR</Button>
        <Button onClick={handleLetterGrade} classname="letter-grade-button">DN</Button>
        <Button onClick={handleLetterGrade} classname="letter-grade-button">HD</Button>
      </div>
    </div>
  );
};

export default EditMarks;
