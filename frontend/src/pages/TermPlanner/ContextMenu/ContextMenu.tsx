import React, { useState } from 'react';
import { Item, Menu } from 'react-contexify';
import { FaRegCalendarTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DeleteFilled, EditFilled, InfoCircleFilled } from '@ant-design/icons';
import axios from 'axios';
import EditMarkModal from 'components/EditMarkModal';
import { RootState } from 'config/store';
import { addTab } from 'reducers/courseTabsSlice';
import { removeCourse } from 'reducers/plannerSlice';
import 'react-contexify/ReactContexify.css';

type Props = {
  code: string;
  scheduled: boolean;
};

const ContextMenu = ({ code, scheduled }: Props) => {
  const { token } = useSelector((state: RootState) => state.settings);
  const [openModal, setOpenModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const showEditMark = () => setOpenModal(true);
  const handleDelete = () => dispatch(removeCourse(code));
  const handleUnschedule = async () => {
    try {
      await axios.post('planner/unscheduleCourse', { courseCode: code }, { params: { token } });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error at handleUnschedule:', err);
    }
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
      <Menu id={`${code}-context`} theme="dark">
        {scheduled && (
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
