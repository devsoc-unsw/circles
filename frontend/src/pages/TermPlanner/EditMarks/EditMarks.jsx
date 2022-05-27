/* eslint-disable */
import { Input , Button } from "antd";
import LetterGradeButton from "./../LetterGradeButton";

import "./index.less";

const EditMarks = ({ handleConfirm, handleKeyDown, inputBuffer, setInputBuffer }) => {
  const handleInputChange = (e) => {
    setInputBuffer(e.target.value);
  }

  const letterGrades = ["SY", "PS", "CR", "DN", "HD"];
  
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
              value={inputBuffer}
              letterGrade={letterGrade}
              handleConfirm={() => handleConfirm(inputBuffer)}
              setInputBuffer={setInputBuffer}
          />))
        }
      </div>
    </div>
  );
};

export default EditMarks;

