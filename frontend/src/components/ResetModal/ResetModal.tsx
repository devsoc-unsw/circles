import React from 'react';
import axios from 'axios';
import { Modal } from 'antd';
import { useAppDispatch } from 'hooks';
import { resetCourses } from 'reducers/coursesSlice';
import { resetTabs } from 'reducers/courseTabsSlice';
import { resetPlanner } from 'reducers/plannerSlice';
import { useSelector } from 'react-redux';
import { RootState } from 'config/store';

type Props = {
  open?: boolean;
  onOk?: () => void; // runs after resetting the data
  onCancel?: () => void;
};

// has no internal "open" state since it becomes difficult to juggle with external buttons
const ResetModal = ({ open, onOk, onCancel }: Props) => {
  const dispatch = useAppDispatch();
  const { token } = useSelector((state: RootState) => state.settings);
  const handleOk = async () => {
    dispatch(resetPlanner());
    try {
      await axios.post('user/reset', {}, { params: { token } });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error resetting degree at handleDegreeChange: ' + err);
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
