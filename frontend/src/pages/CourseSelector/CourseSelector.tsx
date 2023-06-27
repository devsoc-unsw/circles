/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Structure } from 'types/api';
import { ProgramStructure } from 'types/structure';
import openNotification from 'utils/openNotification';
import infographic from 'assets/infographicFontIndependent.svg';
import CourseDescriptionPanel from 'components/CourseDescriptionPanel';
import PageTemplate from 'components/PageTemplate';
import type { RootState } from 'config/store';
import { addTab } from 'reducers/courseTabsSlice';
import CourseBanner from './CourseBanner';
import CourseMenu from './CourseMenu';
import CourseTabs from './CourseTabs';
import S from './styles';
import {
  useQuery,
  useQueryClient,
} from 'react-query';
import { getUserDegree, getUserPlanner } from 'utils/api/userApi';
import { errLogger } from 'utils/queryUtils';


const CourseSelector = () => {
  useQueryClient();

  const [showedNotif, setShowedNotif] = useState(false);
  
  useQuery('planner', getUserPlanner, {
      onError: errLogger("coursesQuery"),
      onSuccess: (data) => {
          // only open for users with no courses
          if (!showedNotif && !Object.keys(data.courses).length) {
            openNotification({
              type: 'info',
              message: 'How do I see more sidebar courses?',
              description:
              'Courses are shown as you meet the requirements to take them. Any course can also be selected via the search bar.'
            });
            setShowedNotif(true);
          }
        }
    });

  const { active, tabs } = useSelector((state: RootState) => state.courseTabs);

  const dispatch = useDispatch();

  const courseCode = tabs[active];


  return (
    <PageTemplate>
      <S.ContainerWrapper>
        <CourseBanner />
        <CourseTabs />
        <S.ContentWrapper>
          <CourseMenu />
          {courseCode ? (
            <div style={{ overflow: 'auto' }}>
              <CourseDescriptionPanel
                courseCode={courseCode}
                onCourseClick={(code) => dispatch(addTab(code))}
              />
            </div>
          ) : (
            <S.InfographicContainer>
              <img src={infographic} alt="How to use Circles infographic" />
            </S.InfographicContainer>
          )}
        </S.ContentWrapper>
      </S.ContainerWrapper>
    </PageTemplate>
  );
};

export default CourseSelector;
