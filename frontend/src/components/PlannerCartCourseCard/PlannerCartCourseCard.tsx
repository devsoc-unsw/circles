import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";
import {
  Button, Popconfirm, Tooltip, Typography,
} from "antd";
import { addTab } from "reducers/courseTabsSlice";
import { removeCourse } from "reducers/plannerSlice";
import S from "./styles";

const { Text } = Typography;

type Props = {
  code: string
  title: string
  showAlert: (c: string) => void
};

const PlannerCartCourseCard = ({ code, title, showAlert }: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const confirmDelete = () => {
    dispatch(removeCourse(code));
    setLoading(true);
    setTimeout(() => {
      showAlert(code);
      setLoading(false);
    }, 700);
  };

  const handleCourseLink = () => {
    navigate("/course-selector");
    dispatch(addTab(code));
  };

  return (
    <S.CourseCardWrapper>
      <div role="menuitem" onClick={handleCourseLink} style={{ cursor: "pointer" }}>
        <Text className="text" strong>
          {code}:{" "}
        </Text>
        <Text className="text">{title}</Text>
      </div>
      <div>
        <Popconfirm
          placement="bottomRight"
          title="Remove this course from your planner?"
          onConfirm={confirmDelete}
          style={{ width: "200px" }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title={`Remove ${code}`}>
            <Button
              danger
              size="small"
              shape="circle"
              icon={<DeleteOutlined />}
              loading={loading}
            />
          </Tooltip>
        </Popconfirm>
      </div>
    </S.CourseCardWrapper>
  );
};

export default PlannerCartCourseCard;
