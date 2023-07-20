import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Tooltip, Typography } from 'antd';
import axios from 'axios';
import { RootState } from 'config/store';
import { addTab } from 'reducers/courseTabsSlice';
import S from './styles';
import openNotification from 'utils/openNotification';

const { Text } = Typography;

type Props = {
  code: string;
  title: string;
};

const CourseCartCard = ({ code, title }: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.settings);

  const handleConfirm = async () => {
    try {
      const res = await axios
        .post(`/planner/removeCourse`, JSON.stringify({ courseCode: code }), { params: { token } });
    } catch (e) {
      openNotification({
        type: 'error',
        message: 'Error removing course',
      });
    }
  };

  const handleClick = () => {
    navigate('/course-selector');
    dispatch(addTab(code));
  };

  return (
    <S.CourseCardWrapper>
      <div role="menuitem" onClick={handleClick}>
        <Text className="text" strong>
          {code}:&nbsp;
        </Text>
        <Text className="text">{title}</Text>
      </div>
      <Popconfirm
        placement="bottomRight"
        title="Remove this course from your planner?"
        onConfirm={handleConfirm}
        style={{ width: '200px' }}
        okText="Yes"
        cancelText="No"
      >
        <Tooltip title={`Remove ${code}`}>
          <Button danger size="small" shape="circle" icon={<DeleteOutlined />} />
        </Tooltip>
      </Popconfirm>
    </S.CourseCardWrapper>
  );
};

export default CourseCartCard;
