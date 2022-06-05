import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button, Input, message,
  Modal,
} from "antd";
import { updateCourseMark } from "reducers/plannerSlice";
import "./index.less";

const EditMarkModal = ({
  code, isVisible, setIsVisible,
}) => {
  const dispatch = useDispatch();
  const [markValue, setMarkValue] = useState(
    useSelector((state) => state.planner.courses[code].mark),
  );

  const letterGrades = ["SY", "PS", "CR", "DN", "HD"];

  const handleConfirmEditMark = (mark) => {
    const attemptedMark = ` ${mark}`.replaceAll(" ", "").toUpperCase();

    if (
      ((/[A-Z]+/.test(attemptedMark)) && !letterGrades.includes(attemptedMark))
      || (parseFloat(attemptedMark) < 0 || parseFloat(attemptedMark) > 100)
      || ((/[A-Z]+/.test(attemptedMark)) && (/[0-9]+/.test(attemptedMark)))
    ) {
      return message.error("Could not update mark. Please enter a valid mark or letter grade");
    }
    dispatch(updateCourseMark({
      code,
      mark: attemptedMark,
    }));
    setMarkValue("");
    setIsVisible(false);
    return message.success("Mark Updated");
  };

  const [markUpdatedQueued, setMarkUpdateQueued] = useState(false);
  useEffect(() => {
    if (markUpdatedQueued) {
      setMarkUpdateQueued(false);
      handleConfirmEditMark(markValue);
    }
  });

  const handleInputChange = (e) => {
    setMarkValue(e.target.value);
  };

  const handleLetterGrade = (e) => {
    e.stopPropagation();
    setMarkValue(e.target.innerText);
    setMarkUpdateQueued(true);
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setMarkUpdateQueued(true);
    }
  };

  return (
    <Modal
      title={`Edit Mark: ${code}`}
      visible={isVisible}
      onOk={() => setMarkUpdateQueued(true)}
      onCancel={handleCancel}
      width="300px"
    >
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
    </Modal>
  );
};

export default EditMarkModal;
