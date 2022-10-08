import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'antd';
import type { RootState } from 'config/store';
import { useAppDispatch, useAppSelector } from 'hooks';
import { resetCourses } from 'reducers/coursesSlice';
import { resetTabs } from 'reducers/courseTabsSlice';
import { resetDegree } from 'reducers/degreeSlice';
import { resetPlanner } from 'reducers/plannerSlice';

const ResetModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const degree = useAppSelector((state: RootState) => state.degree);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (degree.isComplete) {
      setModalVisible(true);
    } else {
      dispatch(resetPlanner());
      dispatch(resetDegree());
      dispatch(resetTabs());
      dispatch(resetCourses());
    }
  }, [degree.isComplete, dispatch]);

  const handleOk = () => {
    setModalVisible(false);
    dispatch(resetPlanner());
    dispatch(resetDegree());
    dispatch(resetTabs());
    dispatch(resetCourses());
  };

  const handleCancel = () => {
    setModalVisible(false);
    navigate('/course-selector');
  };

  return (
    <Modal
      title="Reset Planner?"
      open={modalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Go back to planner
        </Button>,
        <Button key="submit" type="primary" danger onClick={handleOk}>
          Reset
        </Button>,
      ]}
    >
      <div>
        Are you sure want to reset your planner? Your existing data will be
        permanently removed.
      </div>
    </Modal>
  );
};

export default ResetModal;
