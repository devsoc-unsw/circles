import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import axios from 'axios';
import { Course } from 'types/api';
import { JSONPlanner, PlannerCourse, Term } from 'types/planner';
import openNotification from 'utils/openNotification';
import type { RootState } from 'config/store';
import {
  addToUnplanned,
  moveCourse,
  setUnplannedCourseToTerm,
  toggleSummer,
  updateDegreeLength,
  updateStartYear
} from 'reducers/plannerSlice';
import CS from '../common/styles';
import parseAcademicStatement from './inputParsers';
import S from './styles';

const ImportPlannerMenu = () => {
  const plannerState = useSelector((state: RootState) => state.planner);
  const inputJSONRef = useRef<HTMLInputElement>(null);
  const inputPDFRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const uploadJSON = () => {
    inputJSONRef.current?.click();
  };

  const uploadPDF = () => {
    inputPDFRef.current?.click();
  };

  const updatePlanner = (planner: JSONPlanner) => {
    const plannedCourses: string[] = [];
    plannerState.years.forEach((year) => {
      Object.values(year).forEach((termKey) => {
        termKey.forEach((code) => {
          plannedCourses.push(code);
        });
      });
    });

    dispatch(updateDegreeLength(planner.numYears));
    dispatch(updateStartYear(planner.startYear));
    if (plannerState.isSummerEnabled !== planner.isSummerEnabled) {
      dispatch(toggleSummer());
    }

    planner.years.forEach((year, yearIndex) => {
      Object.entries(year).forEach(([term, termCourses]) => {
        termCourses.forEach(async (code, index) => {
          const { data: course } = await axios.get<Course>(`/courses/getCourse/${code}`);
          const courseData: PlannerCourse = {
            title: course.title,
            termsOffered: course.terms,
            UOC: course.UOC,
            plannedFor: null,
            prereqs: course.raw_requirements,
            isLegacy: course.is_legacy,
            isUnlocked: true,
            warnings: [],
            handbookNote: course.handbook_note,
            isAccurate: course.is_accurate,
            isMultiterm: course.is_multiterm,
            supressed: false,
            // TODO: should actually hydrate people's mark
            // and also their suppressions and ignoreFromProgression
            // Maybe we don't need to worry about this as
            // exporting / importing becomes redundant with accounts
            ignoreFromProgression: false,
            mark: undefined // TODO: WTF?
          };

          if (plannedCourses.indexOf(course.code) === -1) {
            plannedCourses.push(course.code);
            dispatch(addToUnplanned({ courseCode: course.code, courseData }));
            const destYear = Number(yearIndex) + Number(plannerState.startYear);
            const destTerm = term as Term;
            const destRow = destYear - plannerState.startYear;
            const destIndex = index;
            dispatch(
              moveCourse({
                course: code,
                destTerm: `${destYear}${destTerm}`,
                srcTerm: 'unplanned'
              })
            );
            dispatch(
              setUnplannedCourseToTerm({
                destRow,
                destTerm,
                destIndex,
                course: code
              })
            );
          }
        });
      });
    });
  };

  const uploadedJSONFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      return;
    }

    if (e.target.files[0].type !== 'application/json') {
      openNotification({
        type: 'error',
        message: 'Import file needs to be JSON.',
        description: 'The uploaded file is not of type JSON.'
      });
      e.target.value = '';
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.readAsText(e.target.files[0], 'UTF-8');
    reader.onload = (ev) => {
      if (ev.target !== null) {
        const content = ev.target.result;
        e.target.value = '';

        try {
          const fileInJson = JSON.parse(content as string) as JSONPlanner;
          if (
            !Object.prototype.hasOwnProperty.call(fileInJson, 'startYear') ||
            !Object.prototype.hasOwnProperty.call(fileInJson, 'numYears') ||
            !Object.prototype.hasOwnProperty.call(fileInJson, 'isSummerEnabled') ||
            !Object.prototype.hasOwnProperty.call(fileInJson, 'years') ||
            !Object.prototype.hasOwnProperty.call(fileInJson, 'version')
          ) {
            openNotification({
              type: 'error',
              message: 'Invalid structure of the JSON file',
              description: 'The structure of the JSON file is not valid.'
            });
            return;
          }
          updatePlanner(fileInJson);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          // eslint-disable-next-line no-console
          console.error('Error at uploadedJSONFile', err);
          openNotification({
            type: 'error',
            message: 'Invalid JSON format',
            description: 'An error occured when parsing the JSON file'
          });
          return;
        }

        openNotification({
          type: 'success',
          message: 'JSON Imported',
          description: 'Planner has been successfully imported.'
        });
      }
    };
  };

  const uploadedPDFFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      return;
    }

    if (e.target.files[0].type !== 'application/pdf') {
      openNotification({
        type: 'error',
        message: 'Import file needs to be PDF.',
        description: 'The uploaded file is not of type PDF.'
      });
      e.target.value = '';
      return;
    }

    setLoading(true);
    try {
      const plannerFromStatement: JSONPlanner = await parseAcademicStatement(e.target.files[0]);
      updatePlanner(plannerFromStatement);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      openNotification({
        type: 'error',
        message: 'Invalid academic statement format',
        description: 'An error occured when processing your academic statement'
      });
      return;
    }
    openNotification({
      type: 'success',
      message: 'Academic Statement Imported',
      description: 'Your academic statement has been successfully imported.'
    });
  };

  const spinIcon = <LoadingOutlined style={{ fontSize: 28 }} spin />;

  return (
    <S.Wrapper style={{ width: '240px' }}>
      <CS.MenuHeader>Import</CS.MenuHeader>
      <CS.MenuDivider />
      <div>Import an existing planner if you have exported it previously as a JSON file.</div>
      <div>If you currently have courses planned, it may be merged with the imported planner.</div>
      <div>
        You can also upload an academic statement that can be used to populate your planner.
      </div>
      <>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CS.Button style={{ width: '100%', margin: '5px' }} onClick={uploadJSON}>
            Upload a planner
          </CS.Button>
          <CS.Button style={{ width: '100%', margin: '5px' }} onClick={uploadPDF}>
            Upload academic statement
          </CS.Button>
          {loading && <Spin indicator={spinIcon} />}
        </div>
        <input
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          ref={inputJSONRef}
          onChange={uploadedJSONFile}
        />
        <input
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          ref={inputPDFRef}
          onChange={uploadedPDFFile}
        />
      </>
    </S.Wrapper>
  );
};

export default ImportPlannerMenu;
