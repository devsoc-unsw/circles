import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  BorderlessTableOutlined,
  EyeFilled,
  EyeInvisibleOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Button, Divider, notification } from 'antd';
import axios from 'axios';
import { Structure } from 'types/api';
import { ProgramStructure } from 'types/structure';
import PageTemplate from 'components/PageTemplate';
import { inDev } from 'config/constants';
import type { RootState } from 'config/store';
import Dashboard from './Dashboard';
import GridView from './GridView/GridView';
import S from './styles';
import TableView from './TableView';
import { StoreUOC } from './types';

type Props = {
  structure: ProgramStructure
  isLoading: boolean
};

const ProgressionCheckerCourses = ({ structure, isLoading }: Props) => {
  const views = {
    GRID: 'grid',
    CONCISE: 'grid-concise',
    TABLE: 'table',
  };
  const defaultView = views.CONCISE;
  const [view, setView] = useState(defaultView);

  return (
    <div>
      {(view === views.GRID || view === views.CONCISE) ? (
        <>
          <S.ViewSwitcherWrapper>
            <Button
              type="primary"
              icon={view === views.GRID ? <EyeInvisibleOutlined /> : <EyeFilled />}
              onClick={() => setView(view === views.GRID ? views.CONCISE : views.GRID)}
            >
              {view === views.GRID ? 'Display Concise Mode' : 'Display Full Mode'}
            </Button>
            {
              inDev && (
                <Button
                  type="primary"
                  icon={<TableOutlined />}
                  onClick={() => setView(views.TABLE)}
                >
                  Display Table View
                </Button>
              )
            }
          </S.ViewSwitcherWrapper>
          <GridView isLoading={isLoading} structure={structure} concise={view === views.CONCISE} />
        </>
      ) : (
        <>
          <S.ViewSwitcherWrapper>
            <Button
              type="primary"
              icon={<BorderlessTableOutlined />}
              onClick={() => setView(defaultView)}
            >
              Display Grid View
            </Button>
          </S.ViewSwitcherWrapper>
          <TableView isLoading={isLoading} structure={structure} />
        </>
      )}
    </div>
  );
};

const ProgressionChecker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [structure, setStructure] = useState<ProgramStructure>({});
  const [uoc, setUoc] = useState(0);

  const {
    programCode, specs,
  } = useSelector((state: RootState) => state.degree);
  const planner = useSelector((state: RootState) => state.planner);

  useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      try {
        const res = await axios.get<Structure>(`/programs/getStructure/${programCode}/${specs.join('+')}`);
        setStructure(res.data.structure);
        setUoc(res.data.uoc);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error at fetchStructure', err);
      }
      setIsLoading(false);
    };
    if (programCode && specs.length > 0) fetchStructure();
  }, [programCode, specs]);

  useEffect(() => {
    notification.info({
      message: 'Disclaimer',
      description: "This progression check is intended to outline the courses required by your degree and may not be 100% accurate. Please refer to UNSW's official progression check and handbook for further accuracy.",
      placement: 'bottomRight',
      duration: 20,
    });
  }, []);

  const storeUOC: StoreUOC = {};

  // Example groups: Major, Minor, General, Rules
  Object.keys(structure).forEach((group) => {
    storeUOC[group] = {
      total: 0,
      curr: 0,
    };

    // Example subgroup: Core Courses, Computing Electives
    Object.keys(structure[group].content).forEach((subgroup) => {
      storeUOC[group].total += structure[group].content[subgroup].UOC;
      const subgroupStructure = structure[group].content[subgroup];

      const isRule = subgroupStructure.type && subgroupStructure.type.includes('rule');

      if (subgroupStructure.courses && !isRule) {
        // only consider disciplinary component courses
        Object.keys(subgroupStructure.courses).forEach((courseCode) => {
          if (planner.courses[courseCode]) {
            storeUOC[group].curr += planner.courses[courseCode].UOC;
          }
        });
      }
    });
  });

  return (
    <PageTemplate>
      <S.Wrapper>
        <Dashboard storeUOC={storeUOC} isLoading={isLoading} structure={structure} uoc={uoc} />
        <div id="divider"><Divider /></div>
        <ProgressionCheckerCourses structure={structure} isLoading={isLoading} />
      </S.Wrapper>
    </PageTemplate>
  );
};

export default ProgressionChecker;
