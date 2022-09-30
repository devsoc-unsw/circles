import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Radio } from 'antd';
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
  updateStartYear,
} from 'reducers/plannerSlice';
import CS from '../common/styles';
import S from './styles';

const ImportPlannerMenu = () => {
  const exportFormats = ['json'];
  const planner = useSelector((state: RootState) => state.planner);
  const inputRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLInputElement>;
  const dispatch = useDispatch();

  const array: string[] = [];

  const download = async () => {
    inputRef.current.click();
  };

  const uploadedJSONFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    planner.years.forEach((year) => {
      Object.values(year).forEach((termKey) => {
        termKey.forEach((code) => {
          array.push(code);
        });
      });
    });
    if (e.target.files !== null) {
      if (e.target.files[0].type !== 'application/json') {
        openNotification({
          type: 'error',
          message: 'Import file needs to be JSON.',
          description: 'The uploaded file is not of type JSON.',
        });
        return;
      }
      const reader = new FileReader();
      reader.readAsText(e.target.files[0], 'UTF-8');
      reader.onload = (ev) => {
        if (ev.target !== null) {
          const content = ev.target.result;
          type FileJSONFormt = {
            startYear: number
            numYears: number
            isSummerEnabled: boolean
            years: PlannerYear[]
          };
          try {
            const fileInJson: FileJSONFormt = JSON.parse(content as string) as FileJSONFormt;
            dispatch(updateDegreeLength(fileInJson.numYears));
            dispatch(updateStartYear(fileInJson.startYear));
            if (planner.isSummerEnabled !== fileInJson.isSummerEnabled) {
              dispatch(toggleSummer());
            }
            (fileInJson.years).forEach((i, ind) => {
              Object.entries(i).forEach(([key, val]) => {
                val.forEach(async (code, index: number) => {
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
                    mark: undefined,
                  };

                  const indexArray = array.indexOf(course.code);
                  if (indexArray === -1) {
                    array.push(course.code);
                    dispatch(addToUnplanned({ courseCode: course.code, courseData }));
                    const destYear = Number(ind) + Number(planner.startYear);
                    const destTerm = key as Term;
                    const destRow = destYear - planner.startYear;
                    const destIndex = index;
                    dispatch(moveCourse({
                      course: code,
                      destTerm: `${destYear}${destTerm}`,
                      srcTerm: 'unplanned',
                    }));
                    dispatch(setUnplannedCourseToTerm({
                      destRow, destTerm, destIndex, course: code,
                    }));
                  }
                });
              });
            });
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            openNotification({
              type: 'error',
              message: 'Invalid structure of the json file',
              description: 'The structure of the JSON file is not valid.',
            });
          }
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
        <Radio.Group defaultValue="json">
          {exportFormats.map((form) => (
            <Radio value={form} className="text">{form}</Radio>
          ))}
        </Radio.Group>
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
