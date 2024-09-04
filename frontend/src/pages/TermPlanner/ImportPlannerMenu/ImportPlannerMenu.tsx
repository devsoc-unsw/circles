import React, { useRef, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import { JSONPlanner, Term } from 'types/planner';
import { badPlanner } from 'types/userResponse';
import { getCourseInfo } from 'utils/api/coursesApi';
import { addToUnplanned, setUnplannedCourseToTerm } from 'utils/api/plannerApi';
import {
  getUserPlanner,
  toggleSummerTerm,
  updateDegreeLength,
  updateStartYear
} from 'utils/api/userApi';
import useNotification from 'hooks/useNotification';
import useToken from 'hooks/useToken';
import CS from '../common/styles';
import S from './styles';

const ImportPlannerMenu = () => {
  const token = useToken();
  const plannerQuery = useQuery({
    queryKey: ['planner'],
    queryFn: () => getUserPlanner(token)
  });
  const planner = plannerQuery.data || badPlanner;
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const upload = () => {
    inputRef.current?.click();
  };

  const importJsonErrorNotification = useNotification({
    name: 'import-json-error-notification',
    type: 'error',
    message: 'Import file needs to be JSON.',
    description: 'The uploaded file is not of type JSON.'
  });

  const invalidJsonStructureNotification = useNotification({
    name: 'invalid-json-structure-error-notification',
    type: 'error',
    message: 'Invalid structure of the JSON file',
    description: 'The structure of the JSON file is not valid.'
  });

  const degreeStartUpdateErrorNotification = useNotification({
    name: 'degree-start-update-error-notification',
    type: 'error',
    message: 'Error setting degree start year or length',
    description: 'There was an error updating the degree start year or length.'
  });

  const summerTermErrorNotification = useNotification({
    name: 'summer-term-error-notification',
    type: 'error',
    message: 'Error setting summer term',
    description: 'An error occurred when trying to import summer term visibility'
  });

  const invalidJsonFormatErrorNotification = useNotification({
    name: 'invalid-json-format-error-notification',
    type: 'error',
    message: 'Invalid JSON format',
    description: 'An error occured when parsing the JSON file'
  });

  const successJsonNotification = useNotification({
    name: 'import-success-notification',
    type: 'success',
    message: 'JSON Imported',
    description: 'Planner has been successfully imported.'
  });

  const uploadedJSONFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) {
      return;
    }

    if (e.target.files[0].type !== 'application/json') {
      importJsonErrorNotification.tryOpenNotification();
      e.target.value = '';
      return;
    }

    const plannedCourses: string[] = [];
    planner.years.forEach((year) => {
      Object.values(year).forEach((termKey) => {
        termKey.forEach((code) => {
          plannedCourses.push(code);
        });
      });
    });

    setLoading(true);
    const reader = new FileReader();
    reader.readAsText(e.target.files[0], 'UTF-8');
    reader.onload = async (ev) => {
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
            invalidJsonStructureNotification.tryOpenNotification();
            return;
          }
          try {
            await updateDegreeLength(token, fileInJson.numYears);
            await updateStartYear(token, fileInJson.startYear.toString());
          } catch {
            degreeStartUpdateErrorNotification.tryOpenNotification();
            return;
          }
          if (planner.isSummerEnabled !== fileInJson.isSummerEnabled) {
            try {
              await toggleSummerTerm(token);
            } catch {
              summerTermErrorNotification.tryOpenNotification();
              return;
            }
          }
          fileInJson.years.forEach((year, yearIndex) => {
            Object.entries(year).forEach(([term, termCourses]) => {
              termCourses.forEach(async (code, index) => {
                const course = await getCourseInfo(code);
                if (plannedCourses.indexOf(course.code) === -1) {
                  plannedCourses.push(course.code);
                  addToUnplanned(token, course.code);
                  const destYear = Number(yearIndex) + Number(planner.startYear);
                  const destTerm = term as Term;
                  const destRow = destYear - planner.startYear;
                  const destIndex = index;
                  const data = {
                    destRow,
                    destTerm,
                    destIndex,
                    courseCode: code
                  };
                  setUnplannedCourseToTerm(token, data);
                }
              });
            });
          });
          setLoading(false);
        } catch (err) {
          setLoading(false);
          // eslint-disable-next-line no-console
          console.error('Error at uploadedJSONFile', err);
          invalidJsonFormatErrorNotification.tryOpenNotification();
          return;
        }

        successJsonNotification.tryOpenNotification();
      }
    };
  };

  const spinIcon = <LoadingOutlined style={{ fontSize: 28 }} spin />;

  return (
    <S.Wrapper style={{ width: '240px' }}>
      <CS.MenuHeader>Import</CS.MenuHeader>
      <CS.MenuDivider />
      <div>Import an existing planner if you have exported it previously as a JSON file.</div>
      <div>If you currently have courses planned, it may be merged with the imported planner.</div>
      <>
        <div style={{ display: 'flex' }}>
          <CS.Button style={{ width: '150px', margin: '5px' }} onClick={upload}>
            Upload a planner
          </CS.Button>
          {loading && <Spin indicator={spinIcon} />}
        </div>
        <input type="file" style={{ display: 'none' }} ref={inputRef} onChange={uploadedJSONFile} />
      </>
    </S.Wrapper>
  );
};

export default ImportPlannerMenu;
