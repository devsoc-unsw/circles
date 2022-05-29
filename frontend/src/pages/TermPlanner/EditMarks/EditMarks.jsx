import React from "react";
import { Input } from "antd";
import LetterGradeButton from "../LetterGradeButton";

import "./index.less";

const EditMarks = ({
  letterGrades, handleConfirm, setInputBuffer, handleKeyDown,
}) => {
  const handleInputChange = (e) => {
    setInputBuffer(e.target.value);
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
            <LetterGradeButton
              letterGrade={letterGrade}
              handleConfirm={() => handleConfirm(letterGrade)}
              setInputBuffer={setInputBuffer}
            />
          ))
        }
      </div>
    </div>
  );
};

export default EditMarks;
