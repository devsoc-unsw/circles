import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Tag, Alert, Typography, Space } from "antd";
import { PlusOutlined, StopOutlined } from "@ant-design/icons";
import { CourseTag } from "../../../components/courseTag/CourseTag";
import { getCourseById } from "./../courseProvider";
import SearchCourse from "../SearchCourse";
import { plannerActions } from "../../../actions/plannerActions";
import { Loading } from "./Loading";
import "./courseDescription.less";

const { Title, Text } = Typography;
const CourseAttribute = ({ title, content }) => {
  return (
    <div className="cs-course-attr">
      <Title level={4} className="text">
        {title}
      </Title>
      <Text className="text">{content}</Text>
    </div>
  );
};
export default function CourseDescription() {
  const dispatch = useDispatch();
  const { active, tabs } = useSelector((state) => state.tabs);
  let id = tabs[active];

  const course = useSelector((state) => state.courses.course);
  const coursesInPlanner = useSelector((state) => state.planner.courses);
  const courseInPlanner = coursesInPlanner.has(id);
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [pageLoaded, setpageLoaded] = React.useState(false);

  React.useEffect(() => {
    if (id === "explore" || id === "search") return;
    dispatch(getCourseById(id));

    setTimeout(() => {
      setpageLoaded(true);
    }, 2000);
  }, [id]);

  if (id === "explore") return <div>This is the explore page</div>;
  if (id === "search") return <SearchCourse />;

  const addToPlanner = () => {
    const data = {
      courseCode: course.code,
      courseData: {
        title: course.title,
        type: "Uncategorised", // TODO: add type
        termsOffered: course.terms,
        uoc: course.uoc,
        plannedFor: null,
        warning: false,
        prereqs: "",
        // TODO: Need to add prereqs
      },
    };
    dispatch(plannerActions("ADD_TO_UNPLANNED", data));
    // dispatch(setUnplannedCourses(id));
    setLoading(true);
    setTimeout(() => {
      setShow(true);
      setLoading(false);
    }, 1000);
    setTimeout(() => {
      setShow(false);
    }, 4000);
  };

  const removeFromPlanner = () => {
    dispatch(plannerActions("REMOVE_COURSE", id));
    setLoading(true);
    setTimeout(() => {
      setShow(true);
      setLoading(false);
    }, 1000);
    setTimeout(() => {
      setShow(false);
    }, 4000);
  };

  return (
    <div>
      <div className="cs-description-root">
        {!pageLoaded ? (
          <Loading />
        ) : (
          <>
            <div className="cs-description-content">
              {show && courseInPlanner && (
                <Alert
                  message={`Successfully added ${id} to your planner!`}
                  type="success"
                  style={{ marginBottom: "1rem" }}
                  showIcon
                  closable
                  afterClose={() => setShow(false)}
                />
              )}
              {show && !courseInPlanner && (
                <Alert
                  message={`Successfully removed ${id} from your planner!`}
                  type="success"
                  className="cs-remove-alert"
                  style={{ marginBottom: "1rem" }}
                  showIcon
                  closable
                  afterClose={() => setShow(false)}
                />
              )}
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
                  <Button
                    type="primary"
                    loading={loading}
                    onClick={addToPlanner}
                    icon={<PlusOutlined />}
                  >
                    Add to planner
                  </Button>
                )}
              </div>
              <Title level={4} className="text">
                Overview
              </Title>
              <Space direction="vertical" style={{ marginBottom: "1rem" }}>
                <Text>
                  <div
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </Text>
              </Space>
              <Title level={4} className="text">
                Requirements
              </Title>
              <Space direction="vertical" style={{ marginBottom: "1rem" }}>
                <Text>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: course.raw_requirements,
                    }}
                  />
                </Text>
              </Space>
              <Title level={4} className="text">
                Courses you have done to unlock this course
              </Title>
              {course.path_from && Object.keys(course.path_from).length > 0 ? (
                <div className={"text course-tag-cont"}>
                  {Object.keys(course.path_from).map((courseCode) => (
                    <CourseTag name={courseCode} />
                  ))}
                </div>
              ) : (
                <p className={`text`}>None</p>
              )}
              <Title level={4} className="text">
                Unlocks these next courses
              </Title>
              {course.path_to && Object.keys(course.path_to).length > 0 ? (
                Object.keys(course.path_to).map((courseCode) => (
                  <CourseTag key={courseCode} name={courseCode} />
                ))
              ) : (
                <p className={`text`}>None</p>
              )}
            </div>
            <div>
              <CourseAttribute title="Faculty" content={course.faculty} />
              <CourseAttribute title="School" content={course.school} />
              <CourseAttribute
                title="Study Level"
                content={course.study_level}
              />
              <CourseAttribute title="Campus" content={course.campus} />
              <Title level={4} className="text cs-final-attr">
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
