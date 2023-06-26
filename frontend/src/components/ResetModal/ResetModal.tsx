import React from 'react';
import { Modal } from 'antd';
import { useAppDispatch } from 'hooks';
import { resetCourses } from 'reducers/coursesSlice';
import { resetTabs } from 'reducers/courseTabsSlice';
import { resetPlanner } from 'reducers/plannerSlice';
import { useQuery } from 'react-query';
import { resetDegree } from 'utils/api/degreeApi';

type Props = {
  open?: boolean;
  onOk?: () => void; // runs after resetting the data
  onCancel?: () => void;
};

// has no internal "open" state since it becomes difficult to juggle with external buttons
const ResetModal = ({ open, onOk, onCancel }: Props) => {
  const dispatch = useAppDispatch();
  const handleOk = async () => {
    dispatch(resetPlanner());
    const degreeQuery = useQuery('degree', resetDegree);
    if (degreeQuery.isError) {
      console.log('Error while resetting degree');
    }
    dispatch(resetTabs());
    dispatch(resetCourses());
    onOk?.();
  };
  return (
    <Modal
      title="Reset Planner?"
      open={open ?? false}
      closable={false}
      onOk={handleOk}
      okText="Reset"
      okButtonProps={{ type: 'primary', danger: true }}
      onCancel={onCancel}
      cancelText="Go back"
    >
      <div>
        Are you sure want to reset your planner? Your existing data will be permanently removed.
      </div>
    </Modal>
  );
};

export default ResetModal;
