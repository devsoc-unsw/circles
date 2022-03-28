import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Tag, Alert, Typography, Space, Menu, Dropdown } from "antd";
import { PlusOutlined, StopOutlined } from "@ant-design/icons";
import { CourseTag } from "../../../components/courseTag/CourseTag";
import { getCourseById } from "./../courseProvider";
import SearchCourse from "../SearchCourse";
import { plannerActions } from "../../../actions/plannerActions";
import { Loading } from "./Loading";
import "./courseDescription.less";
import { prepareUserPayload } from "../helper";
import axios from "axios";
import infographic from "../../../images/infographicFontIndependent.svg";
import { motion } from "framer-motion/dist/framer-motion";
import { axiosRequest } from "../../../axios";
import { setCourse } from "../../../actions/coursesActions";
import { BsPlusLg } from "react-icons/bs";

const { Title, Text } = Typography;
const CourseAttribute = ({ title, content }) => {
  return (
    <div className="cs-course-attr">
      <Title level={3} className="text">
        {title}
      </Title>
      <Text className="text">{content}</Text>
    </div>
  );
};

const PlannerDropdown = ({ courseCode, structure, addToPlanner }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Example groups: Major, Minor, General
    const categoriesDropdown = [];
    for (const group in structure) {
      // Example subGroup: Core Courses, Computing Electives, Flexible Education
      for (const subgroup in structure[group]) {
        const subgroupStructure = structure[group][subgroup];
        if (subgroupStructure.courses) {
          const subCourses = Object.keys(subgroupStructure.courses);
          const regex = subCourses.join("|"); // e.g. "COMP3|COMP4"
          courseCode.match(regex) &&
            categoriesDropdown.push(`${group} - ${subgroup}`);
        }
      }
    }
    if (!categoriesDropdown.length) {
      // add these options to dropdown as a fallback if courseCode is not in
      // major or minor
      categoriesDropdown.push("Flexible Education");
      categoriesDropdown.push("General Education");
    }
    setCategories(categoriesDropdown);
  }, [courseCode]);

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

export default function CourseDescription({ structure }) {
  const dispatch = useDispatch();
  const { active, tabs } = useSelector((state) => state.tabs);
  let id = tabs[active];

  const course = useSelector((state) => state.courses.course);
  const coursesInPlanner = useSelector((state) => state.planner.courses);
  const courseInPlanner = coursesInPlanner.has(id);
  const planner = useSelector((state) => state.planner);
  const degree = useSelector((state) => state.degree);
  const [loading, setLoading] = useState(false);
  const [pageLoaded, setpageLoaded] = useState(false);
  const [coursesPathTo, setCoursesPathTo] = useState({});

  useEffect(() => {
    const getCourse = async () => {
      const [data, err] = await axiosRequest("get", `/courses/getCourse/${id}`);
      if (!err) {
        dispatch(setCourse(data));
        setpageLoaded(true);
      }
    };

    const getPathToCoursesById = async (id) => {
      const [data, err] = await axiosRequest(
        "post",
        `/courses/coursesUnlockedWhenTaken/${id}`,
        prepareUserPayload(degree, planner)
      );
      if (!err) setCoursesPathTo(data.courses_unlocked_when_taken);
    };

    setpageLoaded(false);
    if (id === "explore" || id === "search") return;
    if (id) {
      getCourse();
      getPathToCoursesById(id);
    }
  }, [id]);

  if (tabs.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="empty"
      >
        <img src={infographic} className="infographic" alt="" />
      </motion.div>
    );

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
        warning: false,
        prereqs: course.raw_requirements,
      },
    };
    dispatch(plannerActions("ADD_TO_UNPLANNED", data));
    // dispatch(setUnplannedCourses(id));
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const removeFromPlanner = () => {
    dispatch(plannerActions("REMOVE_COURSE", id));
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
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
              <Title level={3} className="text">
                Overview
              </Title>
              <Space direction="vertical" style={{ marginBottom: "1rem" }}>
                <Text>
                  <div
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </Text>
              </Space>
              <Title level={3} className="text">
                Requirements
              </Title>
              <Space direction="vertical" style={{ marginBottom: "1rem" }}>
                <Text>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: course.raw_requirements || "None",
                    }}
                  />
                </Text>
              </Space>
              <Title level={3} className="text">
                Courses you have done to unlock this course
              </Title>
              {course.path_from && Object.keys(course.path_from).length > 0 ? (
                <div className={"text course-tag-cont"}>
                  {Object.keys(course.path_from).map((courseCode) => (
                    <CourseTag key={courseCode} name={courseCode} />
                  ))}
                </div>
              ) : (
                <p className={`text`}>None</p>
              )}
              <Title level={3} className="text">
                Unlocks these next courses
              </Title>
              {coursesPathTo && Object.values(coursesPathTo).length > 0 ? (
                Object.values(coursesPathTo).map((courseCode) => (
                  <CourseTag key={courseCode} name={courseCode} />
                ))
              ) : (
                <p className={`text`}>None</p>
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
              {course.terms &&
                course.terms.map((term, index) => {
                  let termNo = term.slice(1);
                  return (
                    <Tag key={index} className={`text`}>
                      {course.terms === "Summer" ? "Summer" : `Term ${termNo}`}
                    </Tag>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
