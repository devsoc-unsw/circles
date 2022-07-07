import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "antd";
import { resetCourses } from "reducers/coursesSlice";
import { resetTabs } from "reducers/courseTabsSlice";
import { resetDegree } from "reducers/degreeSlice";
import { resetPlanner } from "reducers/plannerSlice";

const ResetModal = ({ modalVisible, setModalVisible }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleOk = () => {
    setModalVisible(false);
    dispatch(resetPlanner());
    dispatch(resetDegree());
    dispatch(resetTabs());
    dispatch(resetCourses());
  };

  const handleCancel = () => {
    setModalVisible(false);
    navigate("/course-selector");
  };

  return (
    <Modal
      title="Reset Planner?"
      visible={modalVisible}
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
      <p>
        Are you sure want to reset your planner? Your existing data will be
        permanently removed.
      </p>
    </Modal>
  );
};

export default ResetModal;
