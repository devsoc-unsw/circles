import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CalendarOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Alert,
  Button, Tooltip, Typography,
} from "antd";
import { useRouter } from "next/router";
import PlannerCartCourseCard from "components/PlannerCartCourseCard";
import { removeAllCourses } from "reducers/plannerSlice";
import S from "./styles";

const { Text, Title } = Typography;

const PlannerCart = () => {
  const dispatch = useDispatch();
  const router = useRouter();
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
  const { pathname } = useRouter();

  useEffect(() => {
    setOpenMenu(false);
  }, [pathname]);

  return (
    <S.PlannerCartRoot>
      <Tooltip title="Your courses">
        <Button
          type="primary"
          icon={<CalendarOutlined style={{ fontSize: "26px" }} />}
          size="large"
          onClick={() => setOpenMenu(!openMenu)}
        />
      </Tooltip>
      {openMenu && (
        <S.PlannerCartMenu>
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
            <S.PlannerCartContent>
              {/* Reversed map to show the most recently added courses first */}
              {Object.keys(courses).reverse().map((courseCode) => (
                <PlannerCartCourseCard
                  code={courseCode}
                  title={courses[courseCode].title}
                  showAlert={showAlert}
                />
              ))}
            </S.PlannerCartContent>
          ) : (
            <S.PlannerCartEmptyCont>
              <Text className="text">
                You have not selected any courses. Find them in our course
                selector
              </Text>
              <S.LinkButton
                type="secondary"
                shape="round"
                className="planner-cart-link-to-cs"
                onClick={() => {
                  router.push("/course-selector");
                }}
              >
                Go to course selector
              </S.LinkButton>
            </S.PlannerCartEmptyCont>
          )}
          {/* Hacky solution so prevent overflow.. help  */}
          {!show && Object.keys(courses).length > 0 && (
            <S.DelButton
              danger
              className="planner-cart-delete-all-btn"
              icon={<DeleteOutlined />}
              onClick={deleteAllCourses}
            >
              Delete all courses
            </S.DelButton>
          )}
        </S.PlannerCartMenu>
      )}
    </S.PlannerCartRoot>
  );
};

export default PlannerCart;
