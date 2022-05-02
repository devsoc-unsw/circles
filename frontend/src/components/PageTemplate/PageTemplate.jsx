import { Button, Layout, Modal } from "antd";
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetCourses } from "../../reducers/coursesSlice";
import { resetTabs } from "../../reducers/courseTabsSlice";
import { resetDegree } from "../../reducers/degreeSlice";
import { resetPlanner } from "../../reducers/plannerSlice";
import FeedbackButton from "../FeedbackButton";

const { Content } = Layout;

const PageTemplate = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // light mode is always on
  document.body.classList.add("light");

  const handleReset = () => {
    dispatch(resetTabs());
    dispatch(resetCourses());
    dispatch(resetPlanner());
    dispatch(resetDegree());
    localStorage.clear();
    navigate("/degree-wizard");
  };
  return (
    <Content className="app-root content">
      {
        localStorage.getItem("isUpdate") && (
        <Modal
          title="Reset Required"
          visible
          onOk={handleReset}
          closable={false}
          footer={[
            <Button key="submit" type="primary" danger onClick={handleReset}>
              Reset
            </Button>,
          ]}
        >
          It looks last time you visited Circles, there has some been some major changes.
          You would need to reset your degree to plan your courses!
        </Modal>
        )
      }
      {children}
      <FeedbackButton />
    </Content>
  );
};

export default PageTemplate;
