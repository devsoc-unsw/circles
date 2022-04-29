import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Button, notification, Typography, Modal,
} from "antd";
import { useNavigate } from "react-router-dom";
import { scroller } from "react-scroll";
import DegreeStep from "./steps/DegreeStep";
import SpecialisationStep from "./steps/SpecialisationStep";
import MinorStep from "./steps/MinorStep";
import "./main.less";
import YearStep from "./steps/YearStep";
import StartBrowsingStep from "./steps/StartBrowsingStep";
import { resetTabs } from "../../reducers/courseTabsSlice";
import { resetPlanner } from "../../reducers/plannerSlice";
import { resetDegree } from "../../reducers/degreeSlice";
import PageTemplate from "../../components/PageTemplate";
import { resetCourses } from "../../reducers/coursesSlice";

const { Title } = Typography;

const DegreeWizard = () => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const csDegreeDisclaimer = () => {
    notification.info({
      message: "Disclaimer",
      description: "Currently, Circles can only support CS degree and undergrad courses.",
      placement: "bottomRight",
      duration: 4,
    });
  };

  useEffect(() => {
    // TODO: Warning dialog before planner is reset.
    if (localStorage.getItem("planner")) {
      setIsModalVisible(true);
    }
    csDegreeDisclaimer();
  }, []);

  const [currStep, setCurrStep] = useState(1);
  const incrementStep = () => {
    setCurrStep(currStep + 1);
    let nextId = "Degree";
    if (currStep === 1) nextId = "Degree";
    if (currStep === 2) nextId = "Specialisation";
    if (currStep === 3) nextId = "Minor";
    if (currStep === 4) nextId = "Start Browsing";
    setTimeout(() => {
      scroller.scrollTo(nextId, {
        duration: 1500,
        smooth: true,
      });
    }, 100);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    dispatch(resetPlanner());
    dispatch(resetDegree());
    dispatch(resetTabs());
    dispatch(resetCourses());
    localStorage.clear();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    navigate("/course-selector");
  };

  return (
    <PageTemplate>
      <div className="degree-root-container">
        <Modal
          title="Reset Planner?"
          visible={isModalVisible}
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
        <Title>Welcome to Circles!</Title>
        <h3 className=" subtitle">
          Let’s start by setting up your UNSW degree, so you can make a plan that
          suits you.
        </h3>
        <hr className="rule" />

        <div className="steps-container">
          {currStep >= 1 && (
          <div className="step-content" id="Year">
            <YearStep incrementStep={incrementStep} currStep={currStep} />
          </div>
          )}
          {currStep >= 2 && (
          <div className="step-content" id="Degree">
            <DegreeStep incrementStep={incrementStep} currStep={currStep} />
          </div>
          )}
          {currStep >= 3 && (
          <div className="step-content" id="Specialisation">
            <SpecialisationStep
              incrementStep={incrementStep}
              currStep={currStep}
            />
          </div>
          )}
          {currStep >= 4 && (
          <div className="step-content" id="Minor">
            <MinorStep incrementStep={incrementStep} currStep={currStep} />
          </div>
          )}
          {currStep >= 5 && (
          <div className="step-content" id="Start Browsing">
            <StartBrowsingStep />
          </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
};
export default DegreeWizard;
