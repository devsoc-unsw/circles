import React from "react";
import { useSelector } from "react-redux";
import { Typography } from "antd";
import CourseSearchBar from "../CourseSearchBar";
import S from "./styles";

const { Title } = Typography;

const CourseBanner = () => {
  const {
    programCode, programName,
  } = useSelector((state) => state.degree);

  return (
    <S.BannerWrapper>
      <Title level={2} className="text">{programCode} - {programName}</Title>
      <CourseSearchBar />
    </S.BannerWrapper>
  );
};

export default CourseBanner;
