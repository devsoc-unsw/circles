import React from "react";
import { Tooltip, Typography, Modal, Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { plannerActions } from "../../../actions/plannerActions";
import { useHistory } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import DebouncingSelect from "./DebouncingSelect";
import "./steps.less";
import axios from "axios";

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
        courses.map((course) =>
          axios.get(`http://localhost:8000/api/getCourse/${course.value}`)
        )
      );
      for (let course of courseInfoList) {
        const info = course.data;
        const data = {
          code: info.code,
          data: {
            title: info.title,
            type: "Uncategorised", // TODO: add type
            termsOffered: info.terms,
            uoc: info.uoc,
            plannedFor: `${yearIndex + planner.startYear}${termNo}`,
            warning: false,
            prereqs: "",
          },
          position: [yearIndex, termNo],
        };
        dispatch(plannerActions("ADD_TO_PLANNED", data));
      }
    } catch (err) {
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
        {/* Term Box! {yearIndex} {termNo} */}
      </div>
      <Modal
        className="step-modal"
        title="Add courses"
        onCancel={() => setOpen(false)}
        visible={open}
        footer={[
          <Button className="text" key="cancel" onClick={() => setOpen(false)}>
            Cancel
          </Button>,
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
        <DebouncingSelect setPlannedCourses={setCourses} />
      </Modal>
    </>
  );
};
export const PreviousCoursesStep = () => {
  const history = useHistory();
  const planner = useSelector((state) => state.planner);
  const numYears = new Date().getFullYear() - planner.startYear + 1; // Inclusive
  return (
    <div className="steps-root-container">
      <Title level={3} className="text">
        Completed Courses
      </Title>
      {/* Add info button */}
      <div className="steps-grid-cont" style={{ marginTop: "100px" }}>
        <div className="steps-grid-item"></div>
        <div className="steps-grid-item">Summer</div>
        <div className="steps-grid-item">Term 1</div>
        <div className="steps-grid-item">Term 2</div>
        <div className="steps-grid-item">Term 3</div>
      </div>
      {[...Array(parseInt(numYears))].map((_, yearNo) => (
        <div className="steps-grid-cont">
          <div className="steps-grid-item">
            {parseInt(planner.startYear) + yearNo}
          </div>
          {[...Array(4)].map((_, termNo) => {
            // Get the courses in the term
            const term = "T" + termNo.toString();
            return <TermBox yearIndex={yearNo} termNo={term} />;
          })}
        </div>
      ))}

      <Button
        className="steps-next-btn"
        type="primary"
        onClick={() => history.push("/course-selector")}
      >
        Start browsing courses!
      </Button>
    </div>
  );
};
