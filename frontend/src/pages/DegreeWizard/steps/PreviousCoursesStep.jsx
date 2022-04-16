import React from "react";
import {
  Tooltip, Typography, Modal, Button, notification,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import plannerActions from "../../../actions/plannerActions";
import MultiSelectCourse from "./MultiSelectCourse";
import "./steps.less";

const openNotification = (msg) => {
  const args = {
    message: msg,
    duration: 2,
    className: "text helpNotif",
    placement: "topRight",
  };
  notification.error(args);
};

const { Title } = Typography;
const TermBox = ({ yearIndex, termNo }) => {
  const planner = useSelector((store) => store.planner);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [courses, setCourses] = React.useState([]);
  const dispatch = useDispatch();

  const handleSave = async () => {
    setLoading(true);

    try {
      const courseInfoList = await Promise.all(
        courses.map((course) => axios.get(`/courses/getCourse/${course.value}`)),
      );
      courseInfoList.forEach((course) => {
        const info = course.data;
        const data = {
          code: info.code,
          data: {
            title: info.title,
            type: "Uncategorised", // TODO: add type
            termsOffered: info.terms,
            UOC: info.UOC,
            plannedFor: `${yearIndex + planner.startYear}${termNo}`,
            prereqs: "",
            isLegacy: info.is_legacy,
            isUnlocked: true,
            warnings: [],
            handbook_note: "",
          },
          position: [yearIndex, termNo],
        };
        dispatch(plannerActions("ADD_TO_PLANNED", data));
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      setLoading(false);
    }

    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 1000);
  };

  return (
    <>
      <div className="termBox steps-term">
        <Tooltip className="steps-term-edit-btn" size="small" title="Edit">
          <Button
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => setOpen(true)}
          />
        </Tooltip>
        <div className="steps-term-box">
          {courses.map((course) => (
            <div className="text course">{course.value}</div>
          ))}
        </div>
      </div>
      <Modal
        className="step-modal"
        title="Add courses"
        onCancel={() => setOpen(false)}
        visible={open}
        footer={[
          <Button
            key="save"
            type="primary"
            loading={loading}
            onClick={handleSave}
          >
            Save
          </Button>,
        ]}
      >
        <MultiSelectCourse
          plannedCourses={courses}
          setPlannedCourses={setCourses}
        />
      </Modal>
    </>
  );
};
const PreviousCoursesStep = () => {
  const navigate = useNavigate();
  const planner = useSelector((state) => state.planner);
  const numYears = new Date().getFullYear() - planner.startYear + 1; // Inclusive

  const degree = useSelector((state) => state.degree);
  const saveUserSettings = () => {
    if (degree.programCode === "") {
      openNotification("Please select a degree");
    } else if (degree.specialisation === "") {
      openNotification("Please select a specialisation");
    } else {
      localStorage.setItem("degree", JSON.stringify(degree));
      navigate("/course-selector");
    }
  };

  return (
    <div className="steps-root-container">
      <div className="steps-heading-container">
        <Title level={4} className="text">
          What courses have you already completed?
        </Title>

        <Button
          className="steps-next-btn"
          type="primary"
          onClick={saveUserSettings}
        >
          Start browsing courses!
        </Button>
      </div>

      {/* Add info button */}

      <div className="steps-grid-cont">
        <div className="steps-grid-item" />
        <div className="steps-grid-item">Summer</div>
        <div className="steps-grid-item">Term 1</div>
        <div className="steps-grid-item">Term 2</div>
        <div className="steps-grid-item">Term 3</div>
      </div>

      {[...Array(parseInt(numYears, 10))].map((_, yearNo) => (
        <div className="steps-grid-cont">
          <div className="steps-grid-item">
            {parseInt(planner.startYear, 10) + yearNo}
          </div>
          {[...Array.from({ length: 4 })].map((_, termNo) => {
            const term = `T${termNo.toString()}`;
            return <TermBox yearIndex={yearNo} termNo={term} />;
          })}
        </div>
      ))}
    </div>
  );
};

export default PreviousCoursesStep;
