import React from "react";
import { Button, Typography } from "antd";
import "./index.less";
import { useNavigate } from "react-router-dom";
import circlesLogo from "../../assets/circlesLogo.svg";

const { Title } = Typography;
const PageNotFound = () => {
  const navigate = useNavigate();

  return (
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
        <Title className="not-found">404</Title>
        <Title level={2} className="page-text">PAGE NOT FOUND</Title>
        <Button type="primary" size="large" onClick={() => navigate("/course-selector")}>Go Back Home</Button>
      </div>
    </>
  );
};

export default PageNotFound;
