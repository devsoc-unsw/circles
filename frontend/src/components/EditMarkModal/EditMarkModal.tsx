import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, message, Modal } from 'antd';
import { Grade, Mark } from 'types/planner';
import type { RootState } from 'config/store';
import { updateCourseMark } from 'reducers/plannerSlice';
import S from './styles';

type Props = {
  code: string;
  open: boolean;
  onCancel: () => void;
};

const EditMarkModal = ({ code, open, onCancel }: Props) => {
  const dispatch = useDispatch();
  const [markValue, setMarkValue] = useState<string | number | undefined>(
    useSelector((state: RootState) => state.planner.courses[code].mark)
  );

  const letterGrades: Grade[] = ['SY', 'FL', 'PS', 'CR', 'DN', 'HD'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (typeof value === 'number') setMarkValue(Number(value));
    setMarkValue(value);
  };

  const updateMark = (mark: Mark) => {
    dispatch(
      updateCourseMark({
        code,
        mark
      })
    );
    setMarkValue(mark);
    onCancel();
    message.success('Mark Updated');
  };

  const handleUpdateMark = () => {
    if (!Number.isNaN(parseInt(markValue as string, 10))) {
      if (Number(markValue) >= 0 && Number(markValue) <= 100) {
        updateMark(Number(markValue));
      } else {
        // number is not in range
        message.error('Not a valid mark. Enter a mark between 0 and 100.');
      }
    } else if ((letterGrades as string[]).includes(markValue as string)) {
      // mark is a letter grade
      updateMark(markValue as Grade);
    } else if (markValue === '') {
      updateMark(undefined);
    } else {
      message.error('Could not update mark. Please enter a valid mark or letter grade');
    }
  };

  return (
    <Modal
      title={`Edit mark for ${code}`}
      open={open}
      onOk={handleUpdateMark}
      onCancel={onCancel}
      width="350px"
    >
      <S.EditMarkWrapper>
        <Input
          value={markValue}
          onChange={handleInputChange}
          onPressEnter={handleUpdateMark}
          placeholder="Enter Mark"
          style={{ width: '100%' }}
        />
        <S.LetterGradeWrapper>
          {letterGrades.map((letterGrade) => (
            <Button onClick={() => updateMark(letterGrade)}>{letterGrade}</Button>
          ))}
        </S.LetterGradeWrapper>
      </S.EditMarkWrapper>
    </Modal>
  );
};

export default EditMarkModal;
