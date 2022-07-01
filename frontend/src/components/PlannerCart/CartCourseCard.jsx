import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";
import {
  Button, Popconfirm, Tooltip, Typography,
} from "antd";
import { ThemeProvider } from "styled-components";
import { darkTheme, lightTheme } from "config/theme";
import { addTab } from "reducers/courseTabsSlice";
import { removeCourse } from "reducers/plannerSlice";
import S from "./styles";

const { Text } = Typography;

const CartCourseCard = ({ code, title, showAlert }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { theme } = useSelector((state) => state.settings);
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
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <S.plannerCartCard>
        <div role="menuitem" onClick={handleCourseLink} style={{ cursor: "pointer" }}>
          <Text className="text" strong>
            {code}:{" "}
          </Text>
          <Text className="text">{title}</Text>
        </div>
        <div className="planner-cart-card-actions">
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
      </S.plannerCartCard>
    </ThemeProvider>
  );
};

export default CartCourseCard;
