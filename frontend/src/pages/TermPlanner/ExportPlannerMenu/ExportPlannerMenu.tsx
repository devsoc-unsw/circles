import React, { useState } from 'react';
import { Radio } from 'antd';
import { getUser } from 'utils/api/userApi';
import { exportUser } from 'utils/export';
import useToken from 'hooks/useToken';
import CS from '../common/styles';
import S from './styles';

// type Props = {
//   plannerRef: React.RefObject<HTMLDivElement>;
// };

// const ExportPlannerMenu = ({ plannerRef }: Props) => {
const ExportPlannerMenu = () => {
  const token = useToken();

  const plannerRef = React.createRef<HTMLDivElement>();
  const exportFormats = ['png', 'jpg', 'json'];
  const exportFields = { fileName: 'Term Planner' };

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
      getUser(token)
        .then((user) => {
          const exported = exportUser(user);
          const blob = new Blob([JSON.stringify(exported)], { type: 'application/json' });
          const jsonObjectUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = jsonObjectUrl;
          const date = new Date();
          a.download = `circles-planner-export-${date.toISOString()}.json`;
          a.click();
        })
        .catch((err) => {
          console.error('Error at exportPlannerMenu: ', err);
        });
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
            <Radio key={form} value={form} className="text">
              {form}
            </Radio>
          ))}
        </Radio.Group>
      </CS.PopupEntry>
      <CS.Button onClick={download}> Download </CS.Button>
    </S.Wrapper>
  );
};

export default ExportPlannerMenu;
