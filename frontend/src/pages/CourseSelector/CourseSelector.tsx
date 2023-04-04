import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Structure } from 'types/api';
import { CourseDescInfoResCache } from 'types/courseDescription';
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

const CourseSelector = () => {
  const [structure, setStructure] = useState<ProgramStructure>({});

  const { programCode, specs } = useSelector((state: RootState) => state.degree);
  const { courses } = useSelector((state: RootState) => state.planner);
  const { active, tabs } = useSelector((state: RootState) => state.courseTabs);

  const dispatch = useDispatch();

  const courseDescInfoCache = useRef({} as CourseDescInfoResCache);
  const courseCode = tabs[active];

  useEffect(() => {
    // only open for users with no courses
    if (!Object.keys(courses).length) {
      openNotification({
        type: 'info',
        message: 'How do I see more sidebar courses?',
        description:
          'Courses are shown as you meet the requirements to take them. Any course can also be selected via the search bar.'
      });
    }
  }, [courses]);

  useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      try {
        const res = await axios.get<Structure>(
          `/programs/getStructure/${programCode}/${specs.join('+')}`
        );
        setStructure(res.data.structure);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error at fetchStructure', err);
      }
    };
    if (programCode) fetchStructure();
  }, [programCode, specs]);

  const divRef = useRef<null | HTMLDivElement>(null);
  const [offset, setOffset] = useState<number | undefined>();
  useEffect(() => {
    const resizerDiv = divRef.current;
    const handleResize = (ev: globalThis.MouseEvent) => {
      (resizerDiv as HTMLDivElement).style.left = `${ev.clientX}px`;
      setOffset(ev.clientX);
    };
    const endResize = (ev: MouseEvent) => {
      setOffset(ev.clientX);
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', endResize); // remove myself
    };
    const startResize = (ev: MouseEvent) => {
      ev.preventDefault(); // stops highlighting text
      (resizerDiv as HTMLDivElement).style.left = `${ev.clientX}px`;
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', endResize);
    };
    resizerDiv?.addEventListener('mousedown', startResize);
    return () => resizerDiv?.removeEventListener('mousedown', startResize);
  }, []);

  return (
    <PageTemplate>
      <S.ContainerWrapper>
        <CourseBanner />
        <CourseTabs />
        <S.ContentWrapper>
          <div /* very important div!!! */>
            <CourseMenu structure={structure} widthOffset={offset} />
          </div>
          <S.ContentResizer ref={divRef} />
          {courseCode ? (
            <div style={{ overflow: 'auto', width: 'calc(100% - 50px)' }}>
              <CourseDescriptionPanel
                courseCode={courseCode}
                onCourseClick={(code) => dispatch(addTab(code))}
                courseDescInfoCache={courseDescInfoCache}
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
