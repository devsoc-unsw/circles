import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography } from "antd";
import { motion } from "framer-motion";
import infographic from "assets/infographicFontIndependent.svg";
import Collapsible from "components/Collapsible";
import CourseTag from "components/CourseTag";
import ProgressBar from "components/ProgressBar";
import TermTag from "components/TermTag";
import axiosRequest from "config/axios";
import { TERM, TIMETABLE_API_URL } from "config/constants";
import { setCourse } from "reducers/coursesSlice";
import prepareUserPayload from "../utils";
import PrerequisiteTree from "./PrerequisiteTree";
import LoadingSkeleton from "./LoadingSkeleton";
import PlannerButton from "./PlannerButton";
import S from "./styles";

const { Title, Text } = Typography;

const CourseAttribute = ({ title, content }) => (
  <S.AttributeWrapper>
    <Title level={3} className="text">{title}</Title>
    {content}
  </S.AttributeWrapper>
);

const CourseDescription = () => {
  const dispatch = useDispatch();
  const { active, tabs } = useSelector((state) => state.courseTabs);
  const id = tabs[active];

  const course = useSelector((state) => state.courses.course);
  const { degree, planner } = useSelector((state) => state);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [coursesPathTo, setCoursesPathTo] = useState({});
  const [coursesPathFrom, setCoursesPathFrom] = useState([]);
  const [courseCapacity, setCourseCapacity] = useState({});

  const getCourse = async (c) => {
    const [data, err] = await axiosRequest("get", `/courses/getCourse/${c}`);
    if (!err) {
      dispatch(setCourse(data));
    }
  };

  const getPathToCoursesById = async (c) => {
    const [data, err] = await axiosRequest(
      "post",
      `/courses/coursesUnlockedWhenTaken/${c}`,
      prepareUserPayload(degree, planner),
    );
    if (!err) {
      setCoursesPathTo({
        direct_unlock: data.direct_unlock,
        indirect_unlock: data.indirect_unlock,
      });
    }
  };

  const getPathFromCoursesById = async (c) => {
    const [data, err] = await axiosRequest(
      "get",
      `/courses/getPathFrom/${c}`,
    );
    if (!err) {
      setCoursesPathFrom(data.courses);
    }
  };

  const getCapacityAndEnrolment = (data) => {
    const enrolmentCapacityData = {
      enrolments: 0,
      capacity: 0,
    };
    for (let i = 0; i < data.classes.length; i++) {
      if (
        data.classes[i].activity === "Lecture"
        || data.classes[i].activity === "Seminar"
        || data.classes[i].activity === "Thesis Research"
        || data.classes[i].activity === "Project"
      ) {
        enrolmentCapacityData.enrolments
          += data.classes[i].courseEnrolment.enrolments;
        enrolmentCapacityData.capacity
          += data.classes[i].courseEnrolment.capacity;
      }
    }
    setCourseCapacity(enrolmentCapacityData);
  };

  const getCourseCapacityById = async (c) => {
    const [data, err] = await axiosRequest(
      "get",
      `${TIMETABLE_API_URL}/${c}`,
    );
    if (!err) {
      getCapacityAndEnrolment(data);
    } else {
      setCourseCapacity({});
    }
  };

  const fetchCourseData = async (c) => {
    setPageLoaded(false);
    await Promise.all([
      getCourse(c),
      getPathFromCoursesById(c),
      getPathToCoursesById(c),
      getCourseCapacityById(c),
    ]);
    setPageLoaded(true);
  };

  useEffect(() => {
    if (id) fetchCourseData(id);
  }, [id]);

  const courseAttributesData = [
    {
      title: "Offering Terms",
      content: course.terms?.length
        ? course.terms.map((term, index) => {
          const termNo = term.slice(1);
          return (
            <TermTag key={index} name={term === "T0" ? "Summer" : `Term ${termNo}`} />
          );
        })
        : "None",
    },
    {
      title: "UNSW Handbook",
      content: course.study_level ? (
        <a
          href={`https://www.handbook.unsw.edu.au/${course.study_level.toLowerCase()}/courses/2022/${course.code}/`}
          target="_blank"
          rel="noreferrer"
        >
          View {course.code} in handbook
        </a>
      ) : null,
    },
    {
      title: "Faculty",
      content: course.faculty,
    },
    {
      title: "School",
      content: course.school,
    },
    {
      title: "Study Level",
      content: course.study_level,
    },
    {
      title: "Campus",
      content: course.campus,
    },
    {
      title: "Course Capacity",
      content: Object.keys(courseCapacity).length ? (
        <>
          <div>{courseCapacity.capacity} Students for {TERM}</div>
          <ProgressBar
            progress={
                Math.round((courseCapacity.enrolments / courseCapacity.capacity) * 1000) / 10
              }
          />
        </>
      ) : <p>No data available</p>,
    },
  ];

  if (tabs.length === 0) {
    return (
      <S.InfographicContainer
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <img src={infographic} alt="How to use Circles infographic" />
      </S.InfographicContainer>
    );
  }

  return (
    <S.DescriptionWrapper>
      {!pageLoaded ? (
        <LoadingSkeleton />
      ) : (
        <>
          <S.DescriptionContent>
            <S.DescriptionTitleBar>
              <Title level={2} className="text">{id} - {course.title}</Title>
              <PlannerButton />
            </S.DescriptionTitleBar>
            {
              course.is_legacy
              && (
                <Text strong>
                  NOTE: this course is discontinued - if a current course exists, pick that instead
                </Text>
              )
            }
            <Collapsible title="Overview">
              {/* eslint-disable-next-line react/no-danger */}
              <p dangerouslySetInnerHTML={{ __html: course.description || "None" }} />
            </Collapsible>
            <Collapsible title="Requirements">
              {/* eslint-disable-next-line react/no-danger */}
              <p dangerouslySetInnerHTML={{ __html: course.raw_requirements || "None" }} />
            </Collapsible>
            <Collapsible title="Courses you have done to unlock this course">
              <p>
                {coursesPathFrom && coursesPathFrom.length > 0 ? (
                  coursesPathFrom
                    .filter((courseCode) => Object.keys(planner.courses).includes(courseCode))
                    .map((courseCode) => (
                      <CourseTag key={courseCode} name={courseCode} />
                    ))
                ) : "None"}
              </p>
            </Collapsible>
            <Collapsible title="Doing this course will directly unlock these courses">
              <p>
                {coursesPathTo.direct_unlock && coursesPathTo.direct_unlock.length > 0 ? (
                  coursesPathTo.direct_unlock.map((courseCode) => (
                    <CourseTag key={courseCode} name={courseCode} />
                  ))
                ) : "None"}
              </p>
            </Collapsible>
            <Collapsible
              title="Doing this course will indirectly unlock these courses"
              initiallyCollapsed
            >
              <p>
                {coursesPathTo.indirect_unlock && coursesPathTo.indirect_unlock.length > 0 ? (
                  coursesPathTo.indirect_unlock.map((courseCode) => (
                    <CourseTag key={courseCode} name={courseCode} />
                  ))
                ) : "None"}
              </p>
            </Collapsible>
            <Collapsible title="Prerequisite Tree">
              <PrerequisiteTree currCourse={id} coursesPathFrom={coursesPathFrom} coursesPathTo={coursesPathTo} />
            </Collapsible>
          </S.DescriptionContent>
          <S.AttributesContent>
            {courseAttributesData.map(({ title, content }) => (
              content && <CourseAttribute title={title} content={content} />
            ))}
          </S.AttributesContent>
        </>
      )}
    </S.DescriptionWrapper>
  );
};

export default CourseDescription;
