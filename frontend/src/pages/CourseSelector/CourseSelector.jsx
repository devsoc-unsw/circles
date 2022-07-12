import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { notification } from "antd";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import CourseBanner from "./CourseBanner";
import CourseDescription from "./CourseDescription";
import CourseSidebar from "./CourseSidebar";
import CourseTabs from "./CourseTabs";
import S from "./styles";

const CourseSelector = () => {
  const [structure, setStructure] = useState({});

  const {
    programCode, specs,
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
    if (!Object.keys(courses).length) {
      openNotification();
    }
  }, [courses]);

  useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      try {
        const res = await axios.get(`/programs/getStructure/${programCode}/${specs.join("+")}`);
        /* eslint-disable no-console */
        console.log("structure: ", res.data.structure);
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
      <S.ContainerWrapper>
        <CourseBanner />
        <CourseTabs />
        <S.ContentWrapper>
          <CourseSidebar
            structure={structure}
            showLockedCourses={showLockedCourses}
          />
          <CourseDescription structure={structure} />
        </S.ContentWrapper>
      </S.ContainerWrapper>
    </PageTemplate>
  );
};

export default CourseSelector;
