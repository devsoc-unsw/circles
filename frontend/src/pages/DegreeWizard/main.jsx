import React from "react";
import { useDispatch } from "react-redux";
import { Button, Typography, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { scroller } from "react-scroll";
import DegreeStep from "./steps/DegreeStep";
import { SpecialisationStep } from "./steps/SpecialisationStep";
import { PreviousCoursesStep } from "./steps/PreviousCoursesStep";
import { MinorStep } from "./steps/MinorStep";
import plannerActions from "../../actions/plannerActions";
import "./main.less";
import { YearStep } from "./steps/YearStep";

const { Title } = Typography;

const DegreeWizard = () => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    // TODO: Warning dialog before planner is reset.
    if (localStorage.getItem("planner")) {
      setIsModalVisible(true);
    }
  }, []);

  const [currStep, setCurrStep] = React.useState(1);
  const incrementStep = () => {
    setCurrStep(currStep + 1);
    let nextId = "Degree";
    if (currStep === 1) nextId = "Degree";
    if (currStep === 2) nextId = "Specialisation";
    if (currStep === 3) nextId = "Minor";
    if (currStep === 4) nextId = "Previous Courses";
    setTimeout(() => {
      scroller.scrollTo(nextId, {
        duration: 1500,
        smooth: true,
      });
    }, 100);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    // Degree selector needs to reset to prevent identical courses in a term
    dispatch(plannerActions("RESET_PLANNER"));
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    navigate("/course-selector");
  };

  return (
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
          <div className="step-content" id="Previous Courses">
            <PreviousCoursesStep />
          </div>
        )}
      </div>
    </div>
  );
};
export default DegreeWizard;
