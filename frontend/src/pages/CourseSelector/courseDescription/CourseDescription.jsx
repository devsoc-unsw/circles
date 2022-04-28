import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button, Tag, Typography, Space, Menu, Dropdown,
} from "antd";
import { StopOutlined } from "@ant-design/icons";
import { motion } from "framer-motion/dist/framer-motion";
import { BsPlusLg } from "react-icons/bs";
import { CourseTag } from "../../../components/courseTag/CourseTag";
import SearchCourse from "../SearchCourse";
import Loading from "./Loading";
import "./courseDescription.less";
import prepareUserPayload from "../helper";
import infographic from "../../../images/infographicFontIndependent.svg";
import axiosRequest from "../../../axios";
import { setCourse } from "../../../reducers/coursesSlice";
import { addToUnplanned, removeCourse } from "../../../reducers/plannerSlice";

const { Title, Text } = Typography;
const CourseAttribute = ({ title, content }) => (
  <div className="cs-course-attr">
    <Title level={3} className="text">
      {title}
    </Title>
    <Text className="text">{content}</Text>
  </div>
);

const PlannerDropdown = ({ courseCode, structure, addToPlanner }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Example groups: Major, Minor, General
    const categoriesDropdown = [];
    Object.entries(structure).forEach((group, groupContainer) => {
      Object.entries(groupContainer).forEach((subgroup, subgroupStructure) => {
        const subCourses = Object.keys(subgroupStructure.courses);
        if (subCourses.includes(courseCode)) categoriesDropdown.push(`${group} - ${subgroup}`);
      });
    });

    if (!categoriesDropdown.length) {
      // add these options to dropdown as a fallback if courseCode is not in
      // major or minor
      categoriesDropdown.push("Flexible Education");
      categoriesDropdown.push("General Education");
    }
    setCategories(categoriesDropdown);
  }, [structure, courseCode]);

  return (
    <Menu>
      {categories.map((category) => (
        <Menu.Item
          onClick={() => {
            addToPlanner(category);
          }}
        >
          Add as {category}
        </Menu.Item>
      ))}
    </Menu>
  );
};

const CourseDescription = ({ structure }) => {
  const dispatch = useDispatch();
  const { active, tabs } = useSelector((state) => state.courseTabs);
  const id = tabs[active];

  const course = useSelector((state) => state.courses.course);
  const coursesInPlanner = useSelector((state) => state.planner.courses);
  const courseInPlanner = !!coursesInPlanner[id];
  const planner = useSelector((state) => state.planner);
  const degree = useSelector((state) => state.degree);
  const [loading, setLoading] = useState(false);
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

    setpageLoaded(false);
    if (id === "explore" || id === "search") return;
    if (id) {
      getCourse();
      getPathToCoursesById(id);
    }
  }, [id, dispatch, degree, planner]);

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

  if (id === "explore") return <div>This is the explore page</div>;
  if (id === "search") return <SearchCourse />;
  const addToPlanner = (type) => {
    const data = {
      courseCode: course.code,
      courseData: {
        title: course.title,
        type,
        termsOffered: course.terms,
        UOC: course.UOC,
        plannedFor: null,
        prereqs: course.raw_requirements,
        isLegacy: course.is_legacy,
        isUnlocked: true,
        warnings: [],
        handbookNote: course.handbook_note,
        isAccurate: course.is_accurate,
      },
    };
    dispatch(addToUnplanned(data));
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const removeFromPlanner = () => {
    dispatch(removeCourse(id));
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="cs-description-root">
      {!pageLoaded ? (
        <Loading />
      ) : (
        <>
          <div className="cs-description-content">
            <div className="cs-desc-title-bar">
              <Title level={2} className="text">
                {id} - {course.title}
              </Title>
              {courseInPlanner ? (
                <Button
                  type="secondary"
                  loading={loading}
                  onClick={removeFromPlanner}
                  icon={<StopOutlined />}
                >
                  Remove from planner
                </Button>
              ) : (
                <Dropdown.Button
                  overlay={() => (
                    <PlannerDropdown
                      courseCode={course.code}
                      structure={structure}
                      addToPlanner={addToPlanner}
                    />
                  )}
                  loading={loading}
                  onClick={() => {
                    addToPlanner("Uncategorised");
                  }}
                  type="primary"
                >
                  <div className="addBtn">
                    <BsPlusLg />
                    Add to planner
                  </div>
                </Dropdown.Button>
              )}
            </div>
            {
              course.is_legacy
              && (
              <Text strong>
                NOTE: this course is discontinued - if a current course exists, pick that instead
              </Text>
              )
            }
            <Title level={3} className="text">
              Overview
            </Title>
            <Space direction="vertical" style={{ marginBottom: "1rem" }}>
              <Text>
                {/* eslint-disable-next-line react/no-danger */}
                <div dangerouslySetInnerHTML={{ __html: course.description }} />
              </Text>
            </Space>
            <Title level={3} className="text">
              Requirements
            </Title>
            <Space direction="vertical" style={{ marginBottom: "1rem" }}>
              <Text>
                {/* eslint-disable-next-line react/no-danger */}
                <div dangerouslySetInnerHTML={{ __html: course.raw_requirements || "None" }} />
              </Text>
            </Space>
            <Title level={3} className="text">
              Courses you have done to unlock this course
            </Title>
            {course.path_from && Object.keys(course.path_from).length > 0 ? (
              <div className="text course-tag-cont">
                {Object.keys(course.path_from).map((courseCode) => (
                  <CourseTag key={courseCode} name={courseCode} />
                ))}
              </div>
            ) : (
              <p className="text">None</p>
            )}
            <Title level={3} className="text">
              Doing this course will directly unlock these courses
            </Title>
            {coursesPathTo && coursesPathTo.direct_unlock.length > 0 ? (
              coursesPathTo.direct_unlock.map((courseCode) => (
                <CourseTag key={courseCode} name={courseCode} />
              ))
            ) : (
              <p className="text">None</p>
            )}
            <Title level={3} className="text">
              Doing this course will indirectly unlock these courses
            </Title>
            {coursesPathTo && coursesPathTo.indirect_unlock.length > 0 ? (
              coursesPathTo.indirect_unlock.map((courseCode) => (
                <CourseTag key={courseCode} name={courseCode} />
              ))
            ) : (
              <p className="text">None</p>
            )}
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
