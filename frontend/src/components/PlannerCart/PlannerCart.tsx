import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Alert,
  Button, Tooltip, Typography,
} from 'antd';
import PlannerCartCourseCard from 'components/PlannerCartCourseCard';
import type { RootState } from 'config/store';
import { removeAllCourses } from 'reducers/plannerSlice';
import S from './styles';

const { Text, Title } = Typography;

const PlannerCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const courses = useSelector((store: RootState) => store.planner.courses);
  const [openMenu, setOpenMenu] = useState(false);
  const [show, setShow] = useState(false);
  const [code, setCode] = useState('');

  const deleteAllCourses = () => {
    dispatch(removeAllCourses());
  };

  const showAlert = (c: string) => {
    setShow(false);
    setCode(c);
    setShow(true);
    setTimeout(() => {
      setShow(false);
      setCode('');
    }, 3500);
  };
  const pathname = useLocation();

  useEffect(() => {
    setOpenMenu(false);
  }, [pathname]);

  return (
    <S.PlannerCartRoot>
      <Tooltip title="Your courses">
        <Button
          type="primary"
          icon={<CalendarOutlined style={{ fontSize: '26px' }} />}
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
              style={{ margin: '10px' }}
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
                shape="round"
                onClick={() => navigate('/course-selector')}
              >
                Go to course selector
              </S.LinkButton>
            </S.PlannerCartEmptyCont>
          )}
          {/* TODO: Hacky solution so prevent overflow.. help  */}
          {!show && Object.keys(courses).length > 0 && (
            <S.DelButton
              danger
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
