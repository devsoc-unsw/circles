import React, { useState, useEffect } from "react";
import axios from "axios";
import { Switch } from "antd";
import { useSelector } from "react-redux";
import CourseMenu from "./courseMenu/CourseMenu";
import CourseDescription from "./courseDescription";
import CourseTabs from "./courseTabs/CourseTabs";
import "./main.less";
import SearchCourse from "./SearchCourse";
import PageTemplate from "../../components/PageTemplate";

const CourseSelector = () => {
  const [structure, setStructure] = useState({});
  const [showLockedCourses, setShowLockedCourses] = useState(false);

  const {
    programCode, programName, specialisation, minor,
  } = useSelector((state) => state.degree);

  useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      try {
        const res1 = await axios.get(`/programs/getStructure/${programCode}/${specialisation}${minor && `/${minor}`}`);
        setStructure(res1.data.structure);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    };
    if (programCode && specialisation) fetchStructure();
  }, [programCode, specialisation, minor]);

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
          <SearchCourse />
          <Switch
            className="cs-toggle-locked"
            onChange={() => setShowLockedCourses((prev) => !prev)}
            checkedChildren="locked courses shown"
            unCheckedChildren="locked courses hidden"
          />
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
