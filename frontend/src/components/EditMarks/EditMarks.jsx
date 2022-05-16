/* eslint-disable */
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Typography , PageHeader , Input , Button } from "antd";

import "./index.less";

const EditMarks = ({ courseCode, courseTitle, handleCancelEditMark }) => {

  const state = useSelector((state) => state);
  console.log("state:", state);

  const x = [];
  console.log(x);

  // ? Move outside of the function
  // * Not actually needed here - can just leave as letter grade
  //  * handle this map on the backend
  const letterGradeToNumericMap = {
    "FL": 25,
    "PS": 55,
    "CR": 70,
    "DN": 80,
    "HD": 90,
  }

  const handleLetterGrade = (e) => {
    e.preventDefault();
    
    console.log("testing");
    // TODO - 
  }

  const handleInputChange = (e) => {
    console.log(e.target.value);
  }

  return (
    <div className="edit-mark">
      <div className="edit-mark-head">
      </div>
      <Input
        onChange={handleInputChange}
        placeholder="Enter Mark"
      />
      <div className="letter-grade-container">
        <Button onClick={handleLetterGrade} classname="letter-grade-button">FL</Button>
        <Button onClick={handleLetterGrade} classname="letter-grade-button">PS</Button>
        <Button onClick={handleLetterGrade} classname="letter-grade-button">CR</Button>
        <Button onClick={handleLetterGrade} classname="letter-grade-button">DN</Button>
        <Button onClick={handleLetterGrade} classname="letter-grade-button">HD</Button>
      </div>
      <div className="edit-mark-footer">
        <Button className="edit-mark-button edit-mark-confirm" onClick={handleCancelEditMark}>Cancel</Button> 
        <Button className="edit-mark-button edit-mark-cancel" onClick={null}>Save</Button>
      </div>
    </div>
  );
};

export default EditMarks;
