import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Radio } from 'antd';
import { PlannerYear } from 'types/planner';
import type { RootState } from 'config/store';
import CS from '../common/styles';
import S from './styles';

type Props = {
  plannerRef: React.RefObject<HTMLDivElement>;
};
type FileJSONFormat = {
  startYear: number;
  numYears: number;
  isSummerEnabled: boolean;
  years: PlannerYear[];
  version: number;
};

const ExportPlannerMenu = ({ plannerRef }: Props) => {
  const exportFormats = ['png', 'jpg', 'json'];
  const exportFields = { fileName: 'Term Planner' };
  const planner = useSelector((state: RootState) => state.planner);

  const jsonFormat: FileJSONFormat = {
    startYear: planner.startYear,
    numYears: planner.numYears,
    isSummerEnabled: planner.isSummerEnabled,
    years: planner.years,
    version: 0
  };

  const exportComponentAsJSON = () => {
    // Download function for json file.
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(jsonFormat)
    )}`;
    // creating an element for downloading the json file.
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'Term Planner.json';
    link.click();
  };

  const [format, setFormat] = useState('png');

  const download = async () => {
    const { exportComponentAsJPEG, exportComponentAsPNG } = await import(
      'react-component-export-image'
    );
    if (format === 'png') {
      exportComponentAsPNG(plannerRef, exportFields);
    } else if (format === 'jpg') {
      exportComponentAsJPEG(plannerRef, exportFields);
    } else if (format === 'json') {
      exportComponentAsJSON();
    }
  };

  return (
    <S.Wrapper style={{ width: '240px' }}>
      <CS.MenuHeader>Export</CS.MenuHeader>
      <CS.MenuDivider />
      <CS.PopupEntry>
        <CS.MenuText>File Type</CS.MenuText>
        <Radio.Group onChange={(e) => setFormat(e.target.value as string)} defaultValue="png">
          {exportFormats.map((form) => (
            <Radio value={form} className="text">
              {form}
            </Radio>
          ))}
        </Radio.Group>
      </CS.PopupEntry>
      <Button style={{ width: '150px' }} onClick={download}>
        Download
      </Button>
    </S.Wrapper>
  );
};

export default ExportPlannerMenu;
