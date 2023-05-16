/* eslint-disable */
import openNotification from 'utils/openNotification';
import React, { useState } from 'react';
import { Item, Menu } from 'react-contexify';
import { FaRegCalendarTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  DeleteFilled,
  EditFilled,
  InfoCircleFilled,
  PieChartFilled,
  PieChartOutlined
} from '@ant-design/icons';
import EditMarkModal from 'components/EditMarkModal';
import { addTab } from 'reducers/courseTabsSlice';
import { removeCourse, toggleIgnoreFromProgression, unschedule } from 'reducers/plannerSlice';
import 'react-contexify/ReactContexify.css';

type Props = {
  code: string;
  plannedFor: string | null;
  ignoreFromProgression: boolean;
};

const ContextMenu = ({ code, plannedFor, ignoreFromProgression }: Props) => {
  const [openModal, setOpenModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const showEditMark = () => setOpenModal(true);
  const handleDelete = () => dispatch(removeCourse(code));
  const handleUnschedule = () => {
    dispatch(
      unschedule({
        code,
        destIndex: null
      })
    );
  };
  const handleInfo = () => {
    navigate('/course-selector');
    dispatch(addTab(code));
  };
  const handleToggleProgression = () => {
    dispatch(toggleIgnoreFromProgression(code));
  };

  const iconStyle = {
    fontSize: '14px',
    marginRight: '5px'
  };

  return (
    <>
      <Menu id={`${code}-context`} theme="dark">
        {plannedFor && (
          <Item onClick={handleUnschedule}>
            <FaRegCalendarTimes style={iconStyle} /> Unschedule
          </Item>
        )}
        <Item onClick={handleDelete}>
          <DeleteFilled style={iconStyle} /> Delete from Planner
        </Item>
        <Item onClick={showEditMark}>
          <EditFilled style={iconStyle} /> Edit mark
        </Item>
        {ignoreFromProgression ? (
          <Item onClick={handleToggleProgression}>
            <PieChartFilled style={iconStyle} /> Acknowledge Progression
          </Item>
        ) : (
          <Item onClick={handleToggleProgression}>
            <PieChartOutlined style={iconStyle} /> Ignore Progression
          </Item>
        )}
        <Item onClick={handleInfo}>
          <InfoCircleFilled style={iconStyle} /> View Info
        </Item>
      </Menu>
      <EditMarkModal code={code} open={openModal} onCancel={() => setOpenModal(false)} />
    </>
  );
};

export default ContextMenu;
