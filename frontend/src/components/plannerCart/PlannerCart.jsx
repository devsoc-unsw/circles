import React, { useState } from "react";
import {
  Tooltip, Button, Typography, Popconfirm, Alert,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CalendarOutlined, DeleteOutlined } from "@ant-design/icons";
import "./plannerCart.less";
import { addTab } from "../../reducers/courseTabsSlice";
import { removeAllCourses, removeCourse } from "../../reducers/plannerSlice";

const { Text, Title } = Typography;
const CourseCard = ({ code, title, showAlert }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const confirmDelete = () => {
    dispatch(removeCourse(code));
    setLoading(true);
    setTimeout(() => {
      showAlert(code);
      setLoading(false);
    }, 700);
  };

  const handleCourseLink = () => {
    navigate("/course-selector");
    dispatch(addTab(code));
  };

  return (
    <div className="planner-cart-card">
      <div role="menuitem" onClick={handleCourseLink} style={{ cursor: "pointer" }}>
        <Text className="text" strong>
          {code}:{" "}
        </Text>
        <Text className="text">{title}</Text>
      </div>
      <div className="planner-cart-card-actions">
        <Popconfirm
          placement="bottomRight"
          title="Remove this course from your planner?"
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
  const [openMenu, setOpenMenu] = useState(false);
  const [show, setShow] = useState(false);
  const [code, setCode] = useState("");
  const deleteAllCourses = () => {
    dispatch(removeAllCourses());
  };
  const showAlert = (c) => {
    setShow(false);
    setCode(c);
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
          icon={<CalendarOutlined style={{ fontSize: "26px" }} />}
          size="large"
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
          {Object.keys(courses).length > 0 ? (
            <div className="planner-cart-content">
              {/* Reversed map to show the most recently added courses first */}
              {Object.keys(courses).reverse().map((courseCode) => (
                <CourseCard
                  code={courseCode}
                  title={courses[courseCode].title}
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
          {!show && Object.keys(courses).length > 0 && (
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
