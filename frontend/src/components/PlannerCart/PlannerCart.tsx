import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Tooltip, Typography } from 'antd';
import CourseCartCard from 'components/CourseCartCard';
import type { RootState } from 'config/store';
import S from './styles';
import axios from 'axios';
import openNotification from 'utils/openNotification';

const { Text, Title } = Typography;

const PlannerCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const courses = useSelector((store: RootState) => store.planner.courses);
  const { token } = useSelector((state: RootState) => state.settings);
  const [showMenu, setShowMenu] = useState(false);

  const pathname = useLocation();

  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

  const handleRemoveAllCourses = async () => {
    try {
      const res = await axios.post(`/planner/removeAll`, { params: { token } });
    } catch (err) {
      openNotification({
        type: "error",
        message: "Error removing all courses"
      })
    }
  };

  return (
    <S.PlannerCartRoot>
      <Tooltip title="Your courses">
        <Button
          type="primary"
          icon={<CalendarOutlined style={{ fontSize: '26px' }} />}
          size="large"
          onClick={() => setShowMenu((prevState) => !prevState)}
        />
      </Tooltip>
      {showMenu && (
        <S.PlannerCartContainer>
          <Title className="text" level={4}>
            Your selected courses
          </Title>
          {Object.keys(courses).length > 0 ? (
            <>
              <S.CartContentWrapper>
                {/* Reversed map to show the most recently added courses first */}
                {Object.keys(courses)
                  .reverse()
                  .map((courseCode) => (
                    <CourseCartCard code={courseCode} title={courses[courseCode].title} />
                  ))}
              </S.CartContentWrapper>
              {Object.keys(courses).length > 0 && (
                <Button
                  block
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleRemoveAllCourses}
                >
                  Delete all courses
                </Button>
              )}
            </>
          ) : (
            <S.EmptyWrapper>
              <Text className="text">
                You have not selected any courses. Find them in our course selector
              </Text>
              <Button shape="round" onClick={() => navigate('/course-selector')}>
                Go to course selector
              </Button>
            </S.EmptyWrapper>
          )}
        </S.PlannerCartContainer>
      )}
    </S.PlannerCartRoot>
  );
};

export default PlannerCart;
