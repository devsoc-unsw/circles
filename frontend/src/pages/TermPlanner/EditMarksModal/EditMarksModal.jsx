/* eslint-disable */
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Modal, Button, Input, message,
} from "antd";
import { updateCourseMark } from "../../../reducers/plannerSlice";

import "./index.less";

const EditMarksModal = ({
  code, isVisible, setIsVisible,
}) => {
  const dispatch = useDispatch();
  const [markValue, setMarkValue] = useState(
    useSelector((state) => state.planner.courses[code].mark),
  );

  /**
   * 2 - Move the useSelector here for marks
   * 1 - Move the Modal to here
   * 3 - move the
   *
   * */
  /**
   * - [x] showEditMark
   * - [x] validLetterGrade
   * - [x] handleLetterGrade
   * - [] handleMarkUpdateQueue
   * - [] handleConfirm
   * - [] handleKeyDown
   * - [] handleCancel
   */

  const letterGrades = ["SY", "PS", "CR", "DN", "HD"];

  console.log("regex:")
  
  
  const handleConfirmEditMark = (mark) => {
    const attemptedMark = ` ${mark}`.replaceAll(" ", "").toUpperCase();
    // console.log(attemptedMark.match(/[A-Z]*/));
    // console.log(attemptedMark.match(/[0-9]*/));
    console.log(/[A-Z]+/.test(attemptedMark));
    console.log(/[0-9]+/.test(attemptedMark));
    // console.log((parseFloat(attemptedMark).isNaN) && !letterGrades.includes(attemptedMark));
    // console.log(parseFloat(attemptedMark) < 0 || parseFloat(attemptedMark) > 100);

    if (
      // Has lettergrades - invalid
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

export default EditMarksModal;
