import React from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import CourseMenu from "./courseMenu/CourseMenu";
import CourseDescription from "./courseDescription/CourseDescription";
import { CourseTabs } from "./CourseTabs";
import "./main.less";
import SearchCourse from "./SearchCourse";

export default function CourseSelector() {
  const [structure, setStructure] = React.useState({});
  const degree = useSelector((state) => state.degree);
  
  const { programCode, programName, specialisation, minor } = useSelector(
    (state) => state.degree
  );

  React.useEffect(() => {
    fetchStructure();
  }, []);

   // get structure of degree
   const fetchStructure = async () => {
    try {
      const res1 = await axios.get(
        `/programs/getStructure/${programCode}/${specialisation}/${minor}`
      );
      setStructure(res1.data.structure);
    } catch (err) {
      console.log(err);
    }
  };

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
      </div>
      <CourseTabs />
      <div className="cs-bottom-cont">
        <CourseMenu structure={structure} />
        <CourseDescription structure={structure} />
      </div>
    </div>
  );
}
