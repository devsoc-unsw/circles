import React from "react";
import { Tooltip, Button, Typography, Popconfirm, Alert } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";
import { ReactComponent as PlannerIcon } from "../assets/planner-icon.svg";
import { plannerActions } from "../../actions/plannerActions";
import { courseTabActions } from "../../actions/courseTabActions";
import "./plannerCart.less";

const { Text, Title } = Typography;
const CourseCard = ({ code, title, showAlert }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  
  const confirmDelete = () => {
    dispatch(plannerActions("REMOVE_COURSE", code));
    setLoading(true);
    setTimeout(() => {
      showAlert(code);
      setLoading(false);
    }, 700);
  };

  const handleCourseLink = () => {
    navigate(`/course-selector`);
    dispatch(courseTabActions("ADD_TAB", code));
  };

  return (
    <div className="planner-cart-card">
      <div onClick={() => handleCourseLink()} style={{cursor: "pointer"}}>
        <Text className="text" strong>
          {code}:{" "}
        </Text>
        <Text className="text">{title}</Text>
      </div>
      <div className="planner-cart-card-actions">
        <Popconfirm
          placement="bottomRight"
          title={"Remove this course from your planner?"}
          onConfirm={confirmDelete}
          style={{ width: "200px" }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title={`Remove ${code}`}>
            <Button
              danger
              size="small"
              shape="circle"
              icon={<DeleteOutlined />}
              loading={loading}
            />
          </Tooltip>
        </Popconfirm>
      </div>
    </div>
  );
};
export const PlannerCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const courses = useSelector((store) => store.planner.courses);
  const [openMenu, setOpenMenu] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [code, setCode] = React.useState("");
  const deleteAllCourses = () => {
    dispatch(plannerActions("REMOVE_ALL_COURSES"));
  };
  const showAlert = (code) => {
    setShow(false);
    setCode(code);
    setShow(true);
    setTimeout(() => {
      setShow(false);
      setCode("");
    }, 3500);
  };
  return (
    <div className="planner-cart-root">
      <Tooltip title="Your courses">
        <Button
          type="primary"
          icon={<PlannerIcon />}
          onClick={() => setOpenMenu(!openMenu)}
        />
      </Tooltip>
      {openMenu && (
        <div className="planner-cart-menu">
          <Title className="text" level={4}>
            Your selected courses
          </Title>
          {show && (
            <Alert
              message={`Successfully removed ${code} from planner`}
              type="success"
              style={{ margin: "10px" }}
              banner
              showIcon
              closable
              afterClose={() => setShow(false)}
            />
          )}
          {courses.size > 0 ? (
            <div className="planner-cart-content">
              {/* Reversed map to show the most recently added courses first */}
              {[...courses.keys()].reverse().map((courseCode) => (
                <CourseCard
                  code={courseCode}
                  title={courses.get(courseCode).title}
                  showAlert={showAlert}
                />
              ))}
            </div>
          ) : (
            <div className="planner-cart-empty-cont">
              <Text className="text">
                {" "}
                You have not selected any courses. Find them in our course
                selector
              </Text>
              <Button
                type="secondary"
                shape="round"
                className="planner-cart-link-to-cs"
                onClick={() => navigate("/course-selector")}
              >
                Go to course selector
              </Button>
            </div>
          )}
          {/* Hacky solution so prevent overflow.. help  */}
          {!show && courses.size > 0 && (
            <Button
              danger
              className="planner-cart-delete-all-btn"
              icon={<DeleteOutlined />}
              onClick={deleteAllCourses}
            >
              Delete all courses
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PlannerCart;
