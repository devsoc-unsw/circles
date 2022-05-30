import React from "react";
import { Typography } from "antd";
import "./index.less";
import circlesLogo from "../../assets/circlesLogo.svg";

const { Title } = Typography;
const PageNotFound = () => (
  <>
    <div className="main-con">
      <div className="grid-circle">
        <div className="box">
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </div>
        <div className="box-anti">
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </div>
        <div className="box">
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </div>
        <div className="box-anti">
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </div>
        <div className="box-anti">
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </div>
        <div className="box">
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </div>
        <div className="box-anti">
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </div>
        <div className="box">
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </div>
        <div className="box-anti">
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </div>
        <div className="box">
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </div>
        <div className="box-anti">
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </div>
        <div className="box">
          <img alt="circles-logo" src={circlesLogo} width="200" height="200" />
        </div>
      </div>
      <div className="box-container" />
    </div>
    <div className="text404">
      <Title id="headd">404</Title>
      <Title level={2} id="page-text">PAGE NOT FOUND</Title>
    </div>
  </>
);

export default PageNotFound;
