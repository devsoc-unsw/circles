import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Radio } from 'antd';
import { PlannerYear } from 'types/planner';
import type { RootState } from 'config/store';
import { toggleSummer, updateDegreeLength, updateStartYear } from 'reducers/plannerSlice';
import CS from '../common/styles';
import S from './styles';

const ImportPlannerMenu = () => {
  const exportFormats = ['json'];
  const planner = useSelector((state: RootState) => state.planner);
  const inputRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLInputElement>;
  const dispatch = useDispatch();

  const jsonFormat = {
    startYear: planner.startYear,
    numYears: planner.numYears,
    isSummerEnabled: planner.isSummerEnabled,
    years: planner.years,
  };

  const exportComponentAsJSON = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(jsonFormat),
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'Term Planner.json';
    link.click();
  };

  const [format, setFormat] = useState('json');

  const download = async () => {
    inputRef.current.click();
    if (format === 'son') {
      console.log(jsonFormat);
      exportComponentAsJSON();
    }
  };

  const uploadedJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null) {
      console.log(e.target.files[0]);
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
          const fileInJson: FileJSONFormt = JSON.parse(content as string) as FileJSONFormt;
          dispatch(updateDegreeLength(fileInJson.numYears));
          dispatch(updateStartYear(fileInJson.startYear));
          if (planner.isSummerEnabled !== fileInJson.isSummerEnabled) {
            dispatch(toggleSummer());
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
        <Radio.Group onChange={(e) => setFormat(e.target.value as string)} defaultValue="json">
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
