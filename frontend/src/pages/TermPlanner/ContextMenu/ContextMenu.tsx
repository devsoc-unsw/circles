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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeCourse, toggleIgnoreFromProgression, unscheduleCourse } from 'utils/api/plannerApi';
import EditMarkModal from 'components/EditMarkModal';
import { addTab } from 'reducers/courseTabsSlice';
import 'react-contexify/ReactContexify.css';

type Props = {
  code: string;
  plannedFor: string | null;
  ignoreFromProgression: boolean;
};

const ContextMenu = ({ code, plannedFor, ignoreFromProgression }: Props) => {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const showEditMark = () => setOpenModal(true);
  const handleUnschedule = useMutation({
    mutationFn: unscheduleCourse,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['planner']
      })
  });
  const handleDelete = useMutation({
    mutationFn: removeCourse,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['planner']
      })
  });
  const handleInfo = () => {
    navigate('/course-selector');
    dispatch(addTab(code));
  };
  const ignoreFromProgressionMutation = useMutation({
    mutationFn: toggleIgnoreFromProgression,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['courses']
      })
  });
  const handleToggleProgression = () => {
    ignoreFromProgressionMutation.mutate(code);
  };

  const iconStyle = {
    fontSize: '14px',
    marginRight: '5px'
  };

  return (
    <>
      <Menu id={`${code}-context`} theme="dark">
        {plannedFor && (
          <Item
            onClick={() =>
              handleUnschedule.mutate({
                courseCode: code
              })
            }
          >
            <FaRegCalendarTimes style={iconStyle} /> Unschedule
          </Item>
        )}
        <Item onClick={() => handleDelete.mutate(code)}>
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
