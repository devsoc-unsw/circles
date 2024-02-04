import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Tooltip, Typography } from 'antd';
import { badCourses } from 'types/userResponse';
import { removeAll } from 'utils/api/plannerApi';
import { getUserCourses } from 'utils/api/userApi';
import CourseCartCard from 'components/CourseCartCard';
import S from './styles';

const { Text, Title } = Typography;

const PlannerCart = () => {
  const navigate = useNavigate();
  const courses = useQuery('courses', getUserCourses).data || badCourses;
  const removeAllCourses = useMutation('removeCourses', removeAll);
  const [showMenu, setShowMenu] = useState(false);

  const pathname = useLocation();

  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

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
                  onClick={() => removeAllCourses.mutate()}
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
