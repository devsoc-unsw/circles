import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from 'styled-components';
import { useUserCourses, useUserDegree } from 'utils/apiHooks/user';
import openNotification from 'utils/openNotification';
import infographic from 'assets/infographicFontIndependent.svg';
import { addTab } from 'reducers/courseTabsSlice';
import { RootState } from 'config/store';
import CourseBanner from './CourseBanner';
import CourseMenu from './CourseMenu';
import CourseTabs from './CourseTabs';
import CourseDescriptionPanel from 'components/CourseDescriptionPanel';
import PageTemplate from 'components/PageTemplate';
import CourseShowAllButton from './CourseTabs/CourseShowAllButton';
import S from './styles';
import useMobileHook from './UseMobileHook';

const CourseSelector = () => {
  const theme = useTheme();
  const coursesQuery = useUserCourses();
  const degreeQuery = useUserDegree();
  const isMobile = useMobileHook();

  const [showedNotif, setShowedNotif] = useState(false);
  useEffect(() => {
    if (coursesQuery.isSuccess && !showedNotif && !Object.keys(coursesQuery.data).length) {
      openNotification({
        type: 'info',
        message: 'How do I see more sidebar courses?',
        description: (
          <span style={{ color: theme.text }}>
            Courses are shown as you meet the requirements to take them. Any course can also be
            selected via the search bar.
          </span>
        )
      });
      setShowedNotif(true);
    }
  }, [showedNotif, coursesQuery.isSuccess, coursesQuery.data, theme.text]);

  const { active, tabs } = useSelector((state: RootState) => state.courseTabs);

  const dispatch = useDispatch();

  const courseCode = tabs[active];

  const divRef = useRef<null | HTMLDivElement>(null);
  const [menuOffset, setMenuOffset] = useState<number>(isMobile ? 1 : 300); // Set initial width to 1px if mobile

  useEffect(() => {
    // Set min width to 1px to prevent it from collapsing fully
    const minMenuWidth = 1;
    const maxMenuWidth = (60 * window.innerWidth) / 100;
    const resizerDiv = divRef.current as HTMLDivElement;

    const setNewWidth = (clientX: number) => {
      // Ensure the new width doesn't go below the min width or above the max width
      if (clientX < 100) {
        setMenuOffset(minMenuWidth);
      } else if (clientX < maxMenuWidth) {
        setMenuOffset(clientX);
      } else {
        setMenuOffset(maxMenuWidth);
      }
    };
    const handleResize = (ev: globalThis.MouseEvent) => {
      setNewWidth(ev.clientX);
    };
    const endResize = (ev: MouseEvent) => {
      setNewWidth(ev.clientX);
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', endResize); // remove myself
    };
    const startResize = (ev: MouseEvent) => {
      ev.preventDefault(); // stops highlighting text
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', endResize);
    };
    resizerDiv?.addEventListener('mousedown', startResize);

    return () => resizerDiv?.removeEventListener('mousedown', startResize);
  }, []);

  const onCourseClick = useCallback((code: string) => dispatch(addTab(code)), [dispatch]);

  return (
    <PageTemplate>
      <S.ContainerWrapper>
        <CourseBanner courses={coursesQuery.data} />
        <S.CourseHeader>
          <S.CourseShowAllButton $offset={menuOffset}>
            <CourseShowAllButton />
          </S.CourseShowAllButton>
          <CourseTabs />
        </S.CourseHeader>
        <S.ContentWrapper $offset={menuOffset}>
          <CourseMenu courses={coursesQuery.data} degree={degreeQuery.data} />
          <S.ContentResizer ref={divRef} $offset={menuOffset} />
          {courseCode ? (
            <div style={{ overflow: 'auto' }}>
              <CourseDescriptionPanel
                courseCode={courseCode}
                courses={coursesQuery.data}
                onCourseClick={onCourseClick}
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
