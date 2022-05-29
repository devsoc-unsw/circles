import React, { useState, useEffect } from "react";
import axios from "axios";
import { Switch, Tooltip, notification } from "antd";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import CourseMenu from "./CourseMenu";
import CourseDescription from "./CourseDescription";
import CourseTabs from "./CourseTabs";
import PageTemplate from "../../components/PageTemplate";
import "./index.less";
import CourseSearchBar from "./CourseSearchBar";
import { toggleCourseLock } from "../../reducers/coursesSlice";

const CourseSelector = () => {
  const [structure, setStructure] = useState({});
  const dispatch = useDispatch();

  const {
    programCode, programName, minors, majors,
  } = useSelector((state) => state.degree);

  const { courses } = useSelector((state) => state.planner);

  const { isLockedEnabled } = useSelector((state) => state.courses);

  const handleChange = () => {
    dispatch(toggleCourseLock());
  };

  useEffect(() => {
    const openNotification = () => {
      notification.info({
        message: "How do I see more sidebar courses?",
        description: "Courses are shown as you meet the requirements to take them. Any course can also be selected via the search bar.",
        duration: 30,
        className: "text helpNotif",
        placement: "topRight",
      });
    };

    // only open for users with no courses
    if (Object.keys(courses).length === 0) {
      openNotification();
    }
  }, [courses]);

  useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      try {
        const res = await axios.get(`/programs/getStructure/${programCode}/${majors.join("+")}${minors.length > 0 && `/${minors.join("+")}`}`);
        setStructure(res.data.structure);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    };
    if (programCode && (majors.length > 0)) fetchStructure();
  }, [programCode, majors, minors]);

  return (
    <PageTemplate>
      <div className="cs-root">
        <div className="cs-top-cont">
          <div className="cs-degree-cont">
            {programCode !== "" && (
            <h1 className="text">
              {programCode} - {programName}
            </h1>
            )}
          </div>
          <CourseSearchBar />
          <Tooltip placement="topLeft" title={isLockedEnabled ? "Hide locked courses" : "Show locked courses"}>
            <Switch
              defaultChecked={isLockedEnabled}
              className="cs-toggle-locked"
              onChange={() => {
                handleChange();
              }}
              checkedChildren={<LockOutlined />}
              unCheckedChildren={<UnlockOutlined />}
            />
          </Tooltip>
        </div>
        <CourseTabs />
        <div className="cs-bottom-cont">
          <CourseMenu
            structure={structure}
            showLockedCourses={isLockedEnabled}
          />
          <CourseDescription structure={structure} />
        </div>
      </div>
    </PageTemplate>
  );
};

export default CourseSelector;
