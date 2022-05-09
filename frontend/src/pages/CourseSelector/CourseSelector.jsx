import React, { useState, useEffect } from "react";
import axios from "axios";
import { Switch } from "antd";
import { useSelector } from "react-redux";
import CourseMenu from "./CourseMenu";
import CourseDescription from "./CourseDescription";
import CourseTabs from "./CourseTabs";
import PageTemplate from "../../components/PageTemplate";
import "./index.less";
import CourseSearchBar from "./CourseSearchBar";

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
        const res = await axios.get(`/programs/getStructure/${programCode}/${specialisation}${minor && `/${minor}`}`);
        setStructure(res.data.structure);
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
          <CourseSearchBar />
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
