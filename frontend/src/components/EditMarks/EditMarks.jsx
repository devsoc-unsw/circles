/* eslint-disable */
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Typography , PageHeader , Input , Button , Modal , message } from "antd";

import "./index.less";

const EditMarks = ({ handleConfirm, handleKeyDown, inputBuffer, setInputBuffer }) => {


  // ? Move outside of the function
  const handleLetterGrade = (e) => {
    setInputBuffer(e.target.value);
    handleConfirm();
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
        <Button onClick={() => {setInputBuffer("FL"); return handleConfirm();}} className="letter-grade-button">FL</Button>
        <Button onClick={() => {setInputBuffer("PS"); return handleConfirm();}} className="letter-grade-button">PS</Button>
        <Button onClick={() => {setInputBuffer("CR"); return handleConfirm();}} className="letter-grade-button">CR</Button>
        <Button onClick={() => {setInputBuffer("DN"); return handleConfirm();}} className="letter-grade-button">DN</Button>
        <Button onClick={() => {setInputBuffer("HD"); return handleConfirm();}} className="letter-grade-button">HD</Button>
      </div>
    </div>
    </>
  );
};

export default EditMarks;
