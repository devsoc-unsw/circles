import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Tag, Typography, Space,
} from "antd";
import { motion } from "framer-motion/dist/framer-motion";
import { CourseTag } from "../../../components/courseTag/CourseTag";
import prepareUserPayload from "../helper";
import infographic from "../../../images/infographicFontIndependent.svg";
import axiosRequest from "../../../axios";
import { setCourse } from "../../../reducers/coursesSlice";
import Collapsible from "./Collapsible";
import AddToPlannerButton from "./AddToPlannerButton";
import CourseAttribute from "./CourseAttribute";
import "./index.less";
import LoadingSkeleton from "./LoadingSkeleton";

const { Title, Text } = Typography;

const CourseDescription = () => {
  const dispatch = useDispatch();
  const { active, tabs } = useSelector((state) => state.courseTabs);
  const id = tabs[active];

  const course = useSelector((state) => state.courses.course);
  const { degree, planner } = useSelector((state) => state);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [coursesPathTo, setCoursesPathTo] = useState({});

  useEffect(() => {
    const getCourse = async () => {
      const [data, err] = await axiosRequest("get", `/courses/getCourse/${id}`);
      if (!err) {
        dispatch(setCourse(data));
        setPageLoaded(true);
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

    setPageLoaded(false);
    if (id) {
      getCourse();
      getPathToCoursesById(id);
    }
  }, [id]);

  if (tabs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="empty"
      >
        <img src={infographic} className="infographic" alt="" />
      </motion.div>
    );
  }

  return (
    <div className="cs-description-root">
      {!pageLoaded ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="cs-description-content">
            <div className="cs-desc-title-bar">
              <Title level={2} className="text">
                {id} - {course.title}
              </Title>
              <AddToPlannerButton />
            </div>
            {
              course.is_legacy
              && (
              <Text strong>
                NOTE: this course is discontinued - if a current course exists, pick that instead
              </Text>
              )
            }
            <Collapsible
              title="Overview"
            >
              <Space direction="vertical" style={{ marginBottom: "1rem" }}>
                <Text>
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: course.description }} />
                </Text>
              </Space>
            </Collapsible>
            <Collapsible
              title="Requirements"
            >
              <div>
                <Space direction="vertical" style={{ marginBottom: "1rem" }}>
                  <Text>
                    {/* eslint-disable-next-line react/no-danger */}
                    <div dangerouslySetInnerHTML={{ __html: course.raw_requirements || "None" }} />
                  </Text>
                </Space>
              </div>
            </Collapsible>
            <Collapsible
              title="Courses you have done to unlock this course"
            >
              <div>
                {course.path_from && Object.keys(course.path_from).length > 0 ? (
                  <div className="text course-tag-cont">
                    {Object.keys(course.path_from).map((courseCode) => (
                      <CourseTag key={courseCode} name={courseCode} />
                    ))}
                  </div>
                ) : (
                  <p className="text">None</p>
                )}
              </div>
            </Collapsible>
            <Collapsible
              title="Doing this course will directly unlock these courses"
            >
              <div>
                {coursesPathTo.direct_unlock && coursesPathTo.direct_unlock.length > 0 ? (
                  coursesPathTo.direct_unlock.map((courseCode) => (
                    <CourseTag key={courseCode} name={courseCode} />
                  ))
                ) : (
                  <p className="text">None</p>
                )}
              </div>
            </Collapsible>
            <Collapsible
              title="Doing this course will indirectly unlock these courses"
              initiallyCollapsed
            >
              <div>
                {coursesPathTo.indirect_unlock && coursesPathTo.indirect_unlock.length > 0 ? (
                  coursesPathTo.indirect_unlock.map((courseCode) => (
                    <CourseTag key={courseCode} name={courseCode} />
                  ))
                ) : (
                  <p className="text">None</p>
                )}
              </div>
            </Collapsible>
          </div>
          <div>
            {course.faculty && (
              <CourseAttribute title="Faculty" content={course.faculty} />
            )}
            {course.school && (
              <CourseAttribute title="School" content={course.school} />
            )}
            <CourseAttribute
              title="Study Level"
              content={course.study_level}
            />
            <CourseAttribute title="Campus" content={course.campus} />
            <Title level={3} className="text cs-final-attr">
              Offering Terms
            </Title>
            {course.terms
              && course.terms.map((term, index) => {
                const termNo = term.slice(1);
                return (
                  <Tag key={index} className="text">
                    {term === "T0" ? "Summer" : `Term ${termNo}`}
                  </Tag>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default CourseDescription;
