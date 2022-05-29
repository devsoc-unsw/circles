import React from "react";
import { Button } from "antd";

const LetterGradeButton = ({ letterGrade, setInputBuffer, handleConfirm }) => {
  const handleClick = () => {
    setInputBuffer(letterGrade);
    handleConfirm(letterGrade);
  };

  return (
    <Button onClick={handleClick} className="letter-grade-button">
      {letterGrade}
    </Button>
  );
};

export default LetterGradeButton;
