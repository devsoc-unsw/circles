import React from "react";
import axios from "axios";
import { Switch } from "antd";
import { useSelector } from "react-redux";
import CourseMenu from "./courseMenu/CourseMenu";
import CourseDescription from "./courseDescription/CourseDescription";
import { CourseTabs } from "./CourseTabs";
import "./main.less";
import SearchCourse from "./SearchCourse";

export default function CourseSelector() {
  const [structure, setStructure] = React.useState(null);
  const [showLockedCourses, setShowLockedCourses] = React.useState(false);

  const { programCode, programName, specialisation, minor } = useSelector(
    (state) => state.degree
  );

  React.useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      const endpoint = `/programs/getStructure/${programCode}/${specialisation}${
        minor && `/${minor}`
      }`;
      try {
        const res1 = await axios.get(endpoint);
        setStructure(res1.data.structure);
      } catch (err) {
        console.log(err);
      }
    };
    if (programCode && specialisation) fetchStructure();
  }, [programCode, specialisation, minor]);

  return (
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
          onChange={() => setShowLockedCourses(prev => !prev)}
          checkedChildren="locked courses shown"
          unCheckedChildren="locked courses hidden"
        />

      </div>
      <CourseTabs />
      <div className="cs-bottom-cont">
        <CourseMenu structure={structure} showLockedCourses={showLockedCourses} />
        <CourseDescription structure={structure} />
      </div>
    </div>
  );
}
