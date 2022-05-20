/* eslint-disable */
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Typography , PageHeader , Input , Button , Modal , message } from "antd";

import "./index.less";

const EditMarks = ({ courseCode, courseTitle, handleKeyDown, inputBuffer, setInputBuffer }) => {

  const state = useSelector((state) => state);
  console.log("state:", state);

  // ? Move outside of the function
  const handleLetterGrade = (e) => {
    e.preventDefault();
    // TODO - 
  }

  const handleInputChange = (e) => {
    setInputBuffer(e.target.value);
  }

  return (
    <>
    <div className="edit-mark">
      <div className="edit-mark-head">
      </div>
      <Input
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter Mark"
      />
      <div className="letter-grade-container">
        <Button onClick={handleLetterGrade} className="letter-grade-button">FL</Button>
        <Button onClick={handleLetterGrade} className="letter-grade-button">PS</Button>
        <Button onClick={handleLetterGrade} className="letter-grade-button">CR</Button>
        <Button onClick={handleLetterGrade} className="letter-grade-button">DN</Button>
        <Button onClick={handleLetterGrade} className="letter-grade-button">HD</Button>
      </div>
    </div>
    {/* <Modal>
      BAD INPUT MATE@!!! // TODO:
    </Modal> */}
    </>
  );
};

export default EditMarks;
