/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Tabs } from 'antd';
import CourseSearchBar from 'components/CourseSearchBar';
import PageTemplate from 'components/PageTemplate';
import { COURSE_INFO_TAB, HELP_TAB, PROGRAM_STRUCTURE_TAB } from './constants';
import CourseGraph from './CourseGraph/CourseGraph';
import HowToUse from './HowToUse';
import SidebarDrawer from './SidebarDrawer/SidebarDrawer';
import S from './styles';

const GraphicalSelectorNew = () => {
  const [fullscreen, setFullscreen] = useState(true);
  const [courseCode, setCourseCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(HELP_TAB);

  const items = [
    {
      label: 'Course Info',
      key: COURSE_INFO_TAB,
      children: courseCode ? (
        <S.CourseDescriptionPanel
          courseCode={courseCode}
          key={courseCode}
          onCourseClick={setCourseCode}
        />
      ) : (
        'No course selected'
      )
    },
    { label: 'Program Structure', key: PROGRAM_STRUCTURE_TAB, children: 'Program Structure' },
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
              <Tabs items={items} activeKey={activeTab} onChange={setActiveTab} />
            </SidebarDrawer>
          )}
        </S.GraphWrapper>
        {!fullscreen && (
          <S.SidebarWrapper>
            <Tabs items={items} activeKey={activeTab} onChange={setActiveTab} />
          </S.SidebarWrapper>
        )}
      </S.Wrapper>
    </PageTemplate>
  );
};

export default GraphicalSelectorNew;
