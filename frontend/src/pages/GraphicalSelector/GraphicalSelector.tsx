import React, { useRef, useState } from 'react';
import { Tabs } from 'antd';
import CourseSearchBar from 'components/CourseSearchBar';
import PageTemplate from 'components/PageTemplate';
import SidebarDrawer from 'components/SidebarDrawer';
import { CourseDescInfoResCache } from '../../types/courseDescription';
import CS from './common/styles';
import { COURSE_INFO_TAB, HELP_TAB, PROGRAM_STRUCTURE_TAB } from './constants';
import CourseGraph from './CourseGraph';
import HowToUse from './HowToUse';
import S from './styles';

const GraphicalSelector = () => {
  const [fullscreen, setFullscreen] = useState(false);
  const [courseCode, setCourseCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(HELP_TAB);
  const courseDescInfoCache = useRef({} as CourseDescInfoResCache);

  const items = [
    {
      label: 'Course Info',
      key: COURSE_INFO_TAB,
      children: courseCode ? (
        <S.CourseDescriptionPanel
          courseCode={courseCode}
          key={courseCode}
          onCourseClick={setCourseCode}
          courseDescInfoCache={courseDescInfoCache}
        />
      ) : (
        <CS.TextWrapper>No course selected</CS.TextWrapper>
      )
    },
    {
      label: 'Program Structure',
      key: PROGRAM_STRUCTURE_TAB,
      children: <CS.TextWrapper>Program Structure</CS.TextWrapper>
    },
    { label: 'Help', key: HELP_TAB, children: <HowToUse /> }
  ];

  return (
    <PageTemplate>
      <S.Wrapper fullscreen={fullscreen}>
        <S.GraphWrapper fullscreen={fullscreen}>
          <CourseGraph
            onNodeClick={(node) => {
              setCourseCode(node.getID());
              setActiveTab('course-info');
            }}
            fullscreen={fullscreen}
            handleToggleFullscreen={() => setFullscreen((prevState) => !prevState)}
            focused={courseCode ?? undefined}
          />
          <S.SearchBarWrapper>
            <CourseSearchBar onSelectCallback={setCourseCode} style={{ width: '25rem' }} />
          </S.SearchBarWrapper>
          {fullscreen && (
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
        {!fullscreen && (
          <S.SidebarWrapper>
            <Tabs
              items={items}
              activeKey={activeTab}
              onChange={setActiveTab}
              className="graph-sidebar"
            />
          </S.SidebarWrapper>
        )}
      </S.Wrapper>
    </PageTemplate>
  );
};

export default GraphicalSelector;
