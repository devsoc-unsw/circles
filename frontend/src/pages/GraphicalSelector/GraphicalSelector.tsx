import React, { useState } from 'react';
import { Tabs } from 'antd';
import { badCourses } from 'types/userResponse';
import { useUserCourses } from 'utils/apiHooks/user';
import CourseSearchBar from 'components/CourseSearchBar';
import PageTemplate from 'components/PageTemplate';
import CS from './common/styles';
import { COURSE_INFO_TAB, HELP_TAB, UNILECTIVES_TAB } from './constants';
import CourseGraph from './CourseGraph';
import HowToUse from './HowToUse';
import S from './styles';
import UnilectiveReview from './UnilectiveReview/UnilectiveReview';

const GraphicalSelector = () => {
  const [courseCode, setCourseCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(HELP_TAB);
  const [loading, setLoading] = useState(true);
  const coursesQuery = useUserCourses();
  const courses = coursesQuery.data || badCourses;

  const items = [
    {
      label: 'Course Info',
      key: COURSE_INFO_TAB,
      children: courseCode ? (
        <S.CourseDescriptionPanel
          courseCode={courseCode}
          key={courseCode}
          onCourseClick={setCourseCode}
          courses={courses}
        />
      ) : (
        <CS.TextWrapper>No course selected</CS.TextWrapper>
      )
    },
    {
      label: 'Unilectives Reviews',
      key: UNILECTIVES_TAB,
      children: courseCode ? (
        <UnilectiveReview courseCode={courseCode} key={courseCode} />
      ) : (
        <CS.TextWrapper>No course selected</CS.TextWrapper>
      )
    },
    { label: 'Help', key: HELP_TAB, children: <HowToUse /> }
  ];

  return (
    <PageTemplate>
      <S.Wrapper>
        <S.GraphWrapper>
          <CourseGraph
            onNodeClick={(node) => {
              setCourseCode(node.getID());
              setActiveTab(COURSE_INFO_TAB);
            }}
            focused={courseCode ?? undefined}
            loading={loading}
            setLoading={setLoading}
          />

          {!loading && (
            <S.SearchBarWrapper>
              <CourseSearchBar
                userCourses={coursesQuery.data}
                onSelectCallback={(code) => {
                  setCourseCode(code);
                }}
                style={{ width: '25rem' }}
              />
            </S.SearchBarWrapper>
          )}
        </S.GraphWrapper>

        <S.SidebarWrapper>
          <Tabs
            items={items}
            activeKey={activeTab}
            onChange={setActiveTab}
            className="graph-sidebar"
          />
        </S.SidebarWrapper>
      </S.Wrapper>
    </PageTemplate>
  );
};

export default GraphicalSelector;
