<<<<<<< HEAD
import React, { useState } from "react";
=======
import React, { useEffect, useState } from "react";
<<<<<<< HEAD
>>>>>>> dev
import {
  Tooltip, Button, Typography, Alert,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
=======
=======
import { useDispatch, useSelector } from "react-redux";
>>>>>>> dev
import { useLocation, useNavigate } from "react-router-dom";
>>>>>>> dev
import { CalendarOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Alert,
  Button, Tooltip, Typography,
} from "antd";
import { removeAllCourses } from "reducers/plannerSlice";
import CartCourseCard from "./CartCourseCard";
import "./index.less";

const { Text, Title } = Typography;

const PlannerCart = () => {
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
<<<<<<< HEAD
=======
  const pathname = useLocation();

  useEffect(() => {
    setOpenMenu(false);
  }, [pathname]);
>>>>>>> dev

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
                <CartCourseCard
                  code={courseCode}
                  title={courses[courseCode].title}
                  showAlert={showAlert}
                />
              ))}
            </div>
          ) : (
            <div className="planner-cart-empty-cont">
              <Text className="text">
                You have not selected any courses. Find them in our course
                selector
              </Text>
              <Button
                type="secondary"
                shape="round"
                className="planner-cart-link-to-cs"
<<<<<<< HEAD
                onClick={() => navigate("/course-selector")}
=======
                onClick={() => {
                  navigate("/course-selector");
                }}
>>>>>>> dev
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
