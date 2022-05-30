import React from "react";
import { Button, Input } from "antd";

import "./index.less";

const EditMarks = ({
  letterGrades, handleConfirm, setInputBuffer, handleKeyDown,
}) => {
  const handleInputChange = (e) => {
    setInputBuffer(e.target.value);
  };

  const handleLetterGrade = (e) => {
    e.stopPropagation();
    setInputBuffer(e.target.innerText);
    handleConfirm();
  };

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

export default EditMarks;
