// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { useSelector } from 'react-redux';
// import {
//   ExpandAltOutlined,
//   ShrinkOutlined,
//   ZoomInOutlined,
//   ZoomOutOutlined
// } from '@ant-design/icons';
// import type { Graph, GraphOptions, INode, Item } from '@antv/g6';
// import { Button, Switch, Tabs } from 'antd';
// import axios from 'axios';
// import { CourseEdge, CoursesAllUnlocked, GraphPayload } from 'types/api';
// import prepareUserPayload from 'utils/prepareUserPayload';
// import CourseSearchBar from 'components/CourseSearchBar';
// import PageTemplate from 'components/PageTemplate';
// import Spinner from 'components/Spinner';
// import type { RootState } from 'config/store';
// import {
//   COURSE_INFO_TAB,
//   HELP_TAB,
//   PROGRAM_STRUCTURE_TAB,
//   ZOOM_IN_RATIO,
//   ZOOM_OUT_RATIO
// } from './constants';
// import { defaultEdge, defaultNode, mapNodeStyle, nodeStateStyles } from './graph';
// import HowToUse from './HowToUse';
// import S from './styles';
// import CourseGraph from './CourseGraph/CourseGraph';

import React, { useState } from 'react';
import { Tabs } from 'antd';
import CourseSearchBar from 'components/CourseSearchBar';
import PageTemplate from 'components/PageTemplate';
import { COURSE_INFO_TAB, HELP_TAB, PROGRAM_STRUCTURE_TAB } from './constants';
import CourseGraph from './CourseGraph/CourseGraph';
import HowToUse from './HowToUse';
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
          // onCourseClick={(code) => handleFocusCourse(code)}
          onCourseClick={() => {}}
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
      <S.Wrapper>
        <S.GraphWrapper>
          <CourseGraph
            onNodeClick={(node) => {
              setCourseCode(node.getID());
              setActiveTab('course-info');
            }}
            fullscreen={fullscreen}
            handleToggleFullscreen={() => setFullscreen((prevState) => !prevState)}
          />
          <S.SearchBarWrapper>
            <CourseSearchBar
              onSelectCallback={() => {
                // TODO
              }}
              style={{ width: '25rem' }}
            />
          </S.SearchBarWrapper>
        </S.GraphWrapper>
        {fullscreen && (
          <S.SidebarWrapper>
            <Tabs
              items={items}
              activeKey={activeTab}
              onChange={(activeKey) => setActiveTab(activeKey)}
            />
          </S.SidebarWrapper>
        )}
      </S.Wrapper>
    </PageTemplate>
  );
};

export default GraphicalSelectorNew;
