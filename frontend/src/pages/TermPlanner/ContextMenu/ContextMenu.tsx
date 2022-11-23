import React, { useState } from 'react';
import { Item, Menu, theme } from 'react-contexify';
import { FaRegCalendarTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DeleteFilled, EditFilled, InfoCircleFilled } from '@ant-design/icons';
import EditMarkModal from 'components/EditMarkModal';
import { addTab } from 'reducers/courseTabsSlice';
import { removeCourse, unschedule } from 'reducers/plannerSlice';
import 'react-contexify/dist/ReactContexify.css';

type Props = {
  code: string;
  plannedFor: string | null;
};

const ContextMenu = ({ code, plannedFor }: Props) => {
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

  const iconStyle = {
    fontSize: '14px',
    marginRight: '5px'
  };

  return (
    <>
      <Menu id={`${code}-context`} theme={theme.dark}>
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
        <Item onClick={handleInfo}>
          <InfoCircleFilled style={iconStyle} /> View Info
        </Item>
      </Menu>
      <EditMarkModal code={code} open={openModal} onCancel={() => setOpenModal(false)} />
    </>
  );
};

export default ContextMenu;
