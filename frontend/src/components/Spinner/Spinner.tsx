import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import S from "./styles";

const Spinner = ({ text }) => (
  <S.Wrapper>
    <Spin indicator={<LoadingOutlined style={{ fontSize: "2.5rem" }} spin />} />
    <div>{text}</div>
  </S.Wrapper>
);

export default Spinner;
