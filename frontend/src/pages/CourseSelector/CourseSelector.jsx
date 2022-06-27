import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { notification, Switch, Tooltip } from "antd";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import { toggleLockedCourses } from "reducers/settingsSlice";
import CourseDescription from "./CourseDescription";
import CourseMenu from "./CourseMenu";
import CourseSearchBar from "./CourseSearchBar";
import CourseTabs from "./CourseTabs";
import "./index.less";

const CourseSelector = () => {
  const [structure, setStructure] = useState({});
  const dispatch = useDispatch();

  const {
    programCode, programName, specs,
  } = useSelector((state) => state.degree);

  const { courses } = useSelector((state) => state.planner);

  const { showLockedCourses } = useSelector((state) => state.settings);

  useEffect(() => {
    const openNotification = () => {
      notification.info({
        message: "How do I see more sidebar courses?",
        description: "Courses are shown as you meet the requirements to take them. Any course can also be selected via the search bar.",
        duration: 30,
        className: "text helpNotif",
        placement: "bottomRight",
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
        const res = await axios.get(`/programs/getStructure/${programCode}/${specs.join("+")}`);
        setStructure(res.data.structure);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    };
    if (programCode) fetchStructure();
  }, [programCode, specs]);

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
          <Tooltip placement="topLeft" title={showLockedCourses ? "Hide locked courses" : "Show locked courses"}>
            <Switch
              defaultChecked={showLockedCourses}
              className="cs-toggle-locked"
              onChange={() => dispatch(toggleLockedCourses())}
              checkedChildren={<LockOutlined />}
              unCheckedChildren={<UnlockOutlined />}
            />
          </Tooltip>
        </div>
        <CourseTabs />
        <div className="cs-bottom-cont">
          <CourseMenu
            structure={structure}
            showLockedCourses={showLockedCourses}
          />
          <CourseDescription structure={structure} />
        </div>
      </div>
    </PageTemplate>
  );
};

export default CourseSelector;
