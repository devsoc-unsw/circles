import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { notification } from "antd";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import CourseBanner from "./CourseBanner";
import CourseDescription from "./CourseDescription";
import CourseSidebarMenu from "./CourseSidebarMenu";
import CourseTabs from "./CourseTabs";
import S from "./styles";

const CourseSelector = () => {
  const [structure, setStructure] = useState({});

  const {
    programCode, minors, majors,
  } = useSelector((state) => state.degree);
  const { courses } = useSelector((state) => state.planner);
  const { isLockedEnabled } = useSelector((state) => state.courses);

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
        const minorAppend = minors.length > 0 ? `/${minors.join("+")}` : "";
        const res = await axios.get(`/programs/getStructure/${programCode}/${majors.join("+")}${minorAppend}`);
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
      <S.ContainerWrapper>
        <CourseBanner />
        <CourseTabs />
        <S.ContentWrapper>
          <CourseSidebarMenu
            structure={structure}
            showLockedCourses={isLockedEnabled}
          />
          <CourseDescription structure={structure} />
        </S.ContentWrapper>
      </S.ContainerWrapper>
    </PageTemplate>
  );
};

export default CourseSelector;
