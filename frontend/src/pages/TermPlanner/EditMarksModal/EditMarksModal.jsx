/* eslint-disable */
import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Button, Input } from "antd";

import "./index.less";

const EditMarksModal = ({
  courseCode, letterGrades, handleConfirm, setInputBuffer, handleKeyDown,
}) => {

  const markValue = useSelector((state) => state.planner.courses[courseCode].mark);
  console.log("mark value of course", courseCode, markValue);


  const handleInputChange = (e) => {
    setInputBuffer(e.target.value);
  };

  const handleLetterGrade = (e) => {
    e.stopPropagation();
    setInputBuffer(e.target.innerText);
    handleConfirm();
  };

  /**
   * 2 - Move the useSelector here for marks
   * 1 - Move the Modal to here
   * 3 - move the 
   **/


  return (
    <div className="edit-mark">
      <div className="edit-mark-head" />
      <Input
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter Mark"
      />
      <div className="letter-grade-container">
        {
          letterGrades.map((letterGrade) => (
            <Button
              key={letterGrade}
              onClick={handleLetterGrade}
            >
              {letterGrade}
            </Button>
          ))
        }
      </div>
    </div>
  );
};

export default EditMarksModal;
