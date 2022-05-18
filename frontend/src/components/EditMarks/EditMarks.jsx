/* eslint-disable */
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Typography , PageHeader , Input , Button , Modal } from "antd";

import "./index.less";

const EditMarks = ({ courseCode, courseTitle, handleCancelEditMark , inputBuffer, setInputBuffer }) => {

  const state = useSelector((state) => state);
  console.log("state:", state);

  const x = [];
  console.log(x);

  // ? Move outside of the function
  const handleLetterGrade = (e) => {
    e.preventDefault();
    
    console.log("testing");
    // TODO - 
  }

  const handleInputChange = (e) => {
    // console.log(e.target.value);  // TODO: remove
    setInputBuffer(e.target.value);
    console.log("input Buffer: ", inputBuffer)
  }

  return (
    <>
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
      {/*  */}
    </div>
    <Modal>
      BAD INPUT MATE@!!! // TODO:
    </Modal>
    </>
  );
};

export default EditMarks;
