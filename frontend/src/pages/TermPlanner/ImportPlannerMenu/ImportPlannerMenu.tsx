import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Spin } from 'antd';
import axios from 'axios';
import { Course } from 'types/api';
import { JSONPlanner, Term, UnPlannedToTerm } from 'types/planner';
import { badPlanner } from 'types/userResponse';
import { getUserPlanner } from 'utils/api/userApi';
import openNotification from 'utils/openNotification';
import { selectToken } from 'reducers/identitySlice';
import CS from '../common/styles';
import S from './styles';

const ImportPlannerMenu = () => {
  const plannerQuery = useQuery({
    queryKey: ['planner'],
    queryFn: getUserPlanner
  });
  const planner = plannerQuery.data || badPlanner;
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const token = useSelector(selectToken);

  const handleSetUnplannedCourseToTerm = async (data: UnPlannedToTerm) => {
    try {
      await axios.post('planner/unPlannedToTerm', data, { params: { token } });
    } catch (err) {
      // eslint-disable-next-line no-console, @typescript-eslint/restrict-template-expressions
      console.error(`Error at handleSetUnplannedCourseToTerm: ${err}`);
    }
  };

  const upload = () => {
    inputRef.current?.click();
  };

  const handleAddToUnplanned = async (code: string) => {
    try {
      await axios.post('planner/addToUnplanned', { courseCode: code }, { params: { token } });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error at handleAddToUnplanned: ', err);
    }
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
            openNotification({
              type: 'error',
              message: 'Invalid structure of the JSON file',
              description: 'The structure of the JSON file is not valid.'
            });
            return;
          }
          try {
            await axios.put(
              '/user/updateDegreeLength',
              { numYears: fileInJson.numYears },
              { params: { token } }
            );
            await axios.put(
              '/user/updateStartYear',
              { startYear: fileInJson.startYear },
              { params: { token } }
            );
          } catch {
            openNotification({
              type: 'error',
              message: 'Error setting degree start year or length',
              description: 'There was an error updating the degree start year or length.'
            });
            return;
          }
          if (planner.isSummerEnabled !== fileInJson.isSummerEnabled) {
            try {
              await axios.post('/user/toggleSummerTerm', {}, { params: { token } });
            } catch {
              openNotification({
                type: 'error',
                message: 'Error setting summer term',
                description: 'An error occurred when trying to import summer term visibility'
              });
              return;
            }
          }
          fileInJson.years.forEach((year, yearIndex) => {
            Object.entries(year).forEach(([term, termCourses]) => {
              termCourses.forEach(async (code, index) => {
                const { data: course } = await axios.get<Course>(`/courses/getCourse/${code}`);
                if (plannedCourses.indexOf(course.code) === -1) {
                  plannedCourses.push(course.code);
                  handleAddToUnplanned(course.code);
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
                  handleSetUnplannedCourseToTerm(data);
                }
              });
            });
          });
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
