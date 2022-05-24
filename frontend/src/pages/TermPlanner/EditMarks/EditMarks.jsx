/* eslint-disable */
import { Input , Button } from "antd";
import LetterGradeButton from "./../LetterGradeButton";

import "./index.less";

const EditMarks = ({ handleConfirm, handleKeyDown, setInputBuffer }) => {
  const handleInputChange = (e) => {
    setInputBuffer(e.target.value);
  }

  const handleLetterGrade = (e) => {
    e.stopPropagation();
    console.log("id", e.target.id, 10);
    setInputBuffer(e.target.id);
    handleConfirm();
  }

  const letterGrades = ["FL", "PS", "CR", "DN", "HD"];
  
  return (
    <div className="edit-mark">
      <div className="edit-mark-head">
      </div>
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
              handleConfirm={handleConfirm}
              setInputBuffer={setInputBuffer}
          />))
        }
      </div>
    </div>
  );
};

export default EditMarks;

