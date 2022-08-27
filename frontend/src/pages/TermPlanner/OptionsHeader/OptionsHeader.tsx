/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { FaRegCalendarTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  DownloadOutlined, EyeFilled, QuestionCircleOutlined, SaveFilled,
  SettingFilled, WarningFilled,
} from '@ant-design/icons';
import Tippy from '@tippyjs/react';
import { Popconfirm, Switch, Tooltip } from 'antd';
import saveLocalStorageData from 'utils/saveLocalStorageData';
import type { RootState } from 'config/store';
import { unhideAllYears, unscheduleAll } from 'reducers/plannerSlice';
import { toggleShowMarks, toggleShowWarnings } from 'reducers/settingsSlice';
import ExportPlannerMenu from '../ExportPlannerMenu';
import HelpMenu from '../HelpMenu/HelpMenu';
import SettingsMenu from '../SettingsMenu';
import { isPlannerEmpty } from '../utils';
import S from './styles';
// Used for tippy stylings
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

type Props = {
  plannerRef: React.RefObject<HTMLDivElement>
};

const OptionsHeader = ({ plannerRef }: Props) => {
  const { theme } = useSelector((state: RootState) => state.settings);
  const { areYearsHidden, years } = useSelector((state: RootState) => state.planner);
  const { showMarks, showWarnings } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const iconStyles = {
    fontSize: '20px',
    color: '#323739',
  };

  return (
    <S.OptionsHeaderWrapper>
      <S.OptionSection>
        <Tippy
          content={<SettingsMenu />}
          moveTransition="transform 0.2s ease-out"
          interactive
          trigger="click"
          theme={theme}
          zIndex={1}
          placement="bottom-start"
        >
          <div>
            <Tooltip title="Settings">
              <S.OptionButton>
                <SettingFilled style={iconStyles} />
              </S.OptionButton>
            </Tooltip>
          </div>
        </Tippy>
        <Tippy
          content={<ExportPlannerMenu plannerRef={plannerRef} />}
          moveTransition="transform 0.2s ease-out"
          interactive
          trigger="click"
          theme={theme}
          zIndex={1}
          placement="bottom-start"
        >
          <div>
            <Tooltip title="Export">
              <S.OptionButton>
                <DownloadOutlined style={iconStyles} />
              </S.OptionButton>
            </Tooltip>
          </div>
        </Tippy>
        <Tippy
          moveTransition="transform 0.2s ease-out"
          interactive
          trigger="click"
          theme={theme}
          zIndex={1}
          placement="bottom-start"
        >
          <div>
            <Tooltip title="Save">
              <S.OptionButton onClick={() => saveLocalStorageData()}>
                <SaveFilled style={iconStyles} />
              </S.OptionButton>
            </Tooltip>
          </div>
        </Tippy>

        {!isPlannerEmpty(years) && (
          <Tooltip title="Unplan all courses">
            <Popconfirm
              placement="bottomRight"
              title="Are you sure you want to unplan all your courses?"
              onConfirm={() => dispatch(unscheduleAll())}
              style={{ width: '200px' }}
              okText="Yes"
              cancelText="No"
            >
              <S.OptionButton>
                <FaRegCalendarTimes style={iconStyles} />
              </S.OptionButton>
            </Popconfirm>
          </Tooltip>
        )}

        {areYearsHidden && (
          <Tooltip title="Show all hidden years">
            <S.OptionButton onClick={() => dispatch(unhideAllYears())}>
              <EyeFilled style={iconStyles} />
            </S.OptionButton>
          </Tooltip>
        )}
        <Tooltip title="Toggle warnings for previous terms">
          <S.OptionButton onClick={() => dispatch(toggleShowWarnings())}>
            <WarningFilled style={{ ...iconStyles, ...(showWarnings && { color: '#9254de' }) }} />
          </S.OptionButton>
        </Tooltip>
      </S.OptionSection>

      <S.OptionSection>
        <S.ShowMarks>
          <S.TextShowMarks>
            Show Marks
          </S.TextShowMarks>
          <Switch
            defaultChecked={showMarks}
            onChange={() => dispatch(toggleShowMarks())}
          />
        </S.ShowMarks>
        <Tippy
          content={<HelpMenu />}
          moveTransition="transform 0.2s ease-out"
          interactive
          trigger="click"
          theme={theme}
          maxWidth="80vh"
          placement="bottom-start"
        >
          <div>
            <Tooltip title="Help">
              <S.OptionButton>
                <QuestionCircleOutlined style={iconStyles} />
              </S.OptionButton>
            </Tooltip>
          </div>
        </Tippy>
      </S.OptionSection>
    </S.OptionsHeaderWrapper>
  );
};

export default OptionsHeader;
