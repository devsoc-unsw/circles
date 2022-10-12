import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Typography } from 'antd';
import axios from 'axios';
import { Course } from 'types/api';
import { PlannerCourse, PlannerYear, Term } from 'types/planner';
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
import S from './styles';

const { Text } = Typography;
type FileJSONFormat = {
  startYear: number;
  numYears: number;
  isSummerEnabled: boolean;
  years: PlannerYear[];
  version: number;
};

const ImportPlannerMenu = () => {
  const planner = useSelector((state: RootState) => state.planner);
  const inputRef = useRef<HTMLInputElement>() as React.MutableRefObject<HTMLInputElement>;
  const dispatch = useDispatch();

  const download = async () => {
    if (inputRef !== undefined) {
      inputRef.current.click();
    }
  };

  const uploadedJSONFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const plannedCourses: string[] = [];
    planner.years.forEach((year) => {
      Object.values(year).forEach((termKey) => {
        termKey.forEach((code) => {
          plannedCourses.push(code);
        });
      });
    });
    if (e.target.files !== null) {
      if (e.target.files[0].type !== 'application/json') {
        openNotification({
          type: 'error',
          message: 'Import file needs to be JSON.',
          description: 'The uploaded file is not of type JSON.'
        });
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.readAsText(e.target.files[0], 'UTF-8');
      reader.onload = (ev) => {
        if (ev.target !== null) {
          const content = ev.target.result;
          e.target.value = '';

          try {
            const fileInJson = JSON.parse(content as string) as FileJSONFormat;
            if (
              !Object.prototype.hasOwnProperty.call(fileInJson, 'startYear') ||
              !Object.prototype.hasOwnProperty.call(fileInJson, 'numYears') ||
              !Object.prototype.hasOwnProperty.call(fileInJson, 'isSummerEnabled') ||
              !Object.prototype.hasOwnProperty.call(fileInJson, 'years') ||
              !Object.prototype.hasOwnProperty.call(fileInJson, 'version')
            ) {
              openNotification({
                type: 'error',
                message: 'Invalid structure of the json file',
                description: 'The structure of the JSON file is not valid.'
              });
              return;
            }
            dispatch(updateDegreeLength(fileInJson.numYears));
            dispatch(updateStartYear(fileInJson.startYear));
            if (planner.isSummerEnabled !== fileInJson.isSummerEnabled) {
              dispatch(toggleSummer());
            }
            fileInJson.years.forEach((year, yearIndex) => {
              Object.entries(year).forEach(([term, termCourses]) => {
                termCourses.forEach(async (code, index: number) => {
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
                    mark: undefined
                  };

                  if (plannedCourses.indexOf(course.code) === -1) {
                    plannedCourses.push(course.code);
                    dispatch(addToUnplanned({ courseCode: course.code, courseData }));
                    const destYear = Number(yearIndex) + Number(planner.startYear);
                    const destTerm = term as Term;
                    const destRow = destYear - planner.startYear;
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
          } catch (err) {
            // eslint-disable-next-line no-console
            console.log('Error at uploadedJSONFile', err);
            return;
          }

          openNotification({
            type: 'success',
            message: 'JSON Imported',
            description: 'Planner has been successfully imported.'
          });
        }
      };
    }
  };

  return (
    <S.Wrapper style={{ width: '240px' }}>
      <CS.MenuHeader>Import</CS.MenuHeader>
      <CS.MenuDivider />
      <CS.PopupEntry>
        <CS.MenuText>File Type</CS.MenuText>
        <Text>JSON</Text>
      </CS.PopupEntry>
      <>
        <Button style={{ width: '150px' }} onClick={download}>
          Upload a file
        </Button>
        <input type="file" style={{ display: 'none' }} ref={inputRef} onChange={uploadedJSONFile} />
      </>
    </S.Wrapper>
  );
};

export default ImportPlannerMenu;
