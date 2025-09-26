import React, { useEffect, useState } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Drawer, Tabs } from 'antd';
import { badCourses } from 'types/userResponse';
import { useUserCourses } from 'utils/apiHooks/user';
import CourseSearchBar from 'components/CourseSearchBar';
import PageTemplate from 'components/PageTemplate';
import SidebarDrawer from 'components/SidebarDrawer';
import useMediaQuery from 'hooks/useMediaQuery';
import CS from './common/styles';
import { COURSE_INFO_TAB, HELP_TAB, UNILECTIVES_TAB } from './constants';
import CourseGraph from './CourseGraph';
import HowToUse from './HowToUse';
import S from './styles';
import UnilectiveReview from './UnilectiveReview/UnilectiveReview';

const GraphicalSelector = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [fullscreen, setFullscreen] = useState(isMobile);
  const [courseCode, setCourseCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(HELP_TAB);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const coursesQuery = useUserCourses();
  const [loading, setLoading] = useState(true);
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
      <S.Wrapper $fullscreen={fullscreen}>
        <S.GraphWrapper $fullscreen={fullscreen}>
          <CourseGraph
            onNodeClick={(node) => {
              setCourseCode(node.getID());
              setActiveTab('course-info');
              if (isMobile) {
                setMobileDrawerOpen(true);
              }
            }}
            fullscreen={fullscreen}
            handleToggleFullscreen={() => setFullscreen((prevState) => !prevState)}
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
                  if (isMobile) {
                    setMobileDrawerOpen(true);
                  }
                }}
                style={{ width: isMobile ? '100%' : '25rem' }}
              />
            </S.SearchBarWrapper>
          )}
          {isMobile && !loading && (
            <S.MobileMenuButton
              type="primary"
              icon={<InfoCircleOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              title="Course Information"
            />
          )}
          {fullscreen && !isMobile && (
            <SidebarDrawer>
              <Tabs
                items={items}
                activeKey={activeTab}
                onChange={setActiveTab}
                className="graph-sidebar-fullscreen"
              />
            </SidebarDrawer>
          )}
        </S.GraphWrapper>
        {!fullscreen && !isMobile && (
          <S.SidebarWrapper>
            <Tabs
              items={items}
              activeKey={activeTab}
              onChange={setActiveTab}
              className="graph-sidebar"
            />
          </S.SidebarWrapper>
        )}
        {isMobile && (
          <Drawer
            title="Course Information"
            placement="bottom"
            onClose={() => setMobileDrawerOpen(false)}
            open={mobileDrawerOpen}
            height="70vh"
            className="mobile-course-drawer"
          >
            <Tabs
              items={items}
              activeKey={activeTab}
              onChange={setActiveTab}
              className="mobile-course-tabs"
            />
          </Drawer>
        )}
      </S.Wrapper>
    </PageTemplate>
  );
};

export default GraphicalSelector;
