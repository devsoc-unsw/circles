import React, { useState } from 'react';
import { Item, Menu, theme } from 'react-contexify';
import { FaRegCalendarTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DeleteFilled from '@ant-design/icons/DeleteFilled';
import EditFilled from '@ant-design/icons/EditFilled';
import InfoCircleFilled from '@ant-design/icons/InfoCircleFilled';
import EditMarkModal from 'components/EditMarkModal';
import { addTab } from 'reducers/courseTabsSlice';
import { removeCourse, unschedule } from 'reducers/plannerSlice';
import 'react-contexify/dist/ReactContexify.css';

type Props = {
  code: string
  plannedFor: string | null
};

const ContextMenu = ({ code, plannedFor }: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = () => {
    dispatch(removeCourse(code));
  };

  const handleUnschedule = () => {
    dispatch(unschedule({
      code,
      destIndex: null,
    }));
  };
  const id = `${code}-context`;

  const handleInfo = () => {
    navigate('/course-selector');
    dispatch(addTab(code));
  };

  const [isEditMarkVisible, setIsEditMarkVisible] = useState(false);

  const showEditMark = () => {
    setIsEditMarkVisible(true);
  };

  const iconStyle = {
    fontSize: '14px',
    marginRight: '5px',
  };

  return (
    <>
      <Menu id={id} theme={theme.dark}>
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
      <EditMarkModal
        code={code}
        isVisible={isEditMarkVisible}
        setIsVisible={setIsEditMarkVisible}
      />
    </>
  );
};

export default ContextMenu;
