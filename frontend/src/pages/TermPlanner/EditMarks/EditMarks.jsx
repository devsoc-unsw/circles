import React from "react";
import { Input } from "antd";
import LetterGradeButton from "../LetterGradeButton";

import "./index.less";

const EditMarks = ({
  letterGrades, handleConfirm, inputBuffer, setInputBuffer,
}) => {
  const handleInputChange = (e) => {
    setInputBuffer(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleConfirm();
    }
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
              value={inputBuffer}
              letterGrade={letterGrade}
              handleConfirm={handleConfirm}
              setInputBuffer={setInputBuffer}
            />
          ))
        }
      </div>
    </div>
  );
};

export default EditMarks;
