import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button, Input, message,
  Modal,
} from "antd";
import { updateCourseMark } from "reducers/plannerSlice";
import S from "./styles";
import { RootState } from "config/store";

type Props = {
  code: string
  isVisible: boolean
  setIsVisible: any
}

const EditMarkModal = ({
  code, isVisible, setIsVisible,
}: Props) => {
  const dispatch = useDispatch();
  const [markValue, setMarkValue] = useState(
    useSelector((state: RootState) => state.planner.courses[code].mark),
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
      title={`Edit mark for ${code}`}
      visible={isVisible}
      onOk={() => setMarkUpdateQueued(true)}
      onCancel={handleCancel}
      width="300px"
    >
      <S.EditMarkWrapper>
        <Input
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter Mark"
        />
        <S.LetterGradeWrapper>
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
        </S.LetterGradeWrapper>
      </S.EditMarkWrapper>
    </Modal>
  );
};

export default EditMarkModal;
