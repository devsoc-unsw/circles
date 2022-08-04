import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { Switch, Tooltip, Typography } from "antd";
import { RootState } from "config/store";
import { toggleLockedCourses } from "reducers/settingsSlice";
import CourseSearchBar from "../CourseSearchBar";
import S from "./styles";

const { Title } = Typography;

const CourseBanner = () => {
  const dispatch = useDispatch();
  const {
    programCode, programName,
  } = useSelector((state: RootState) => state.degree);

  const { showLockedCourses } = useSelector((state: RootState) => state.settings);

  return (
    <S.BannerWrapper>
      <Title level={2} className="text">{programCode} - {programName}</Title>
      <CourseSearchBar />
      <Tooltip placement="topLeft" title={showLockedCourses ? "Hide locked courses" : "Show locked courses"}>
        <Switch
          defaultChecked={showLockedCourses}
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
