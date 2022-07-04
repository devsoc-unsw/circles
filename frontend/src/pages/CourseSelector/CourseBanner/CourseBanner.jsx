import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { Switch, Tooltip, Typography } from "antd";
import { toggleLockedCourses } from "reducers/settingsSlice";
import CourseSearchBar from "../CourseSearchBar";
import S from "./styles";

const { Title } = Typography;

const CourseBanner = () => {
  const dispatch = useDispatch();
  const {
    programCode, programName,
  } = useSelector((state) => state.degree);

  const { isLockedEnabled } = useSelector((state) => state.courses);

  return (
    <S.BannerWrapper>
      <Title level={2} className="text">{programCode} - {programName}</Title>
      <CourseSearchBar />
      <Tooltip placement="topLeft" title={isLockedEnabled ? "Hide locked courses" : "Show locked courses"}>
        <Switch
          defaultChecked={isLockedEnabled}
          style={{ alignSelf: "flex-end" }}
          onChange={() => dispatch(toggleLockedCourses())}
          checkedChildren={<LockOutlined />}
          unCheckedChildren={<UnlockOutlined />}
        />
      </Tooltip>
    </S.BannerWrapper>
  );
};

export default CourseBanner;
