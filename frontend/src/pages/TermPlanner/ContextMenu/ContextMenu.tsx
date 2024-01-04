import React, { useState } from 'react';
import { Item, Menu } from 'react-contexify';
import { FaRegCalendarTimes } from 'react-icons/fa';
import { useMutation, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DeleteFilled, EditFilled, InfoCircleFilled } from '@ant-design/icons';
import { removeCourse, unscheduleCourse } from 'utils/api/plannerApi';
import EditMarkModal from 'components/EditMarkModal';
import { addTab } from 'reducers/courseTabsSlice';
import 'react-contexify/ReactContexify.css';

type Props = {
  code: string;
  scheduled: boolean;
};

const ContextMenu = ({ code, scheduled }: Props) => {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const showEditMark = () => setOpenModal(true);
  const handleUnschedule = useMutation(unscheduleCourse, {
    onSuccess: () => queryClient.invalidateQueries('planner')
  });
  const handleDelete = useMutation(removeCourse, {
    onSuccess: () => queryClient.invalidateQueries('planner')
  });
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
        <Item onClick={handleInfo}>
          <InfoCircleFilled style={iconStyle} /> View Info
        </Item>
      </Menu>
      <EditMarkModal code={code} open={openModal} onCancel={() => setOpenModal(false)} />
    </>
  );
};

export default ContextMenu;
