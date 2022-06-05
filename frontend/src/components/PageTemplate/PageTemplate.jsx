import { Layout } from "antd";
import React from "react";
<<<<<<< HEAD
=======
import { Helmet } from "react-helmet";
>>>>>>> dev
import FeedbackButton from "../FeedbackButton";

const { Content } = Layout;

const PageTemplate = ({ children }) => (
<<<<<<< HEAD
  <Content className="app-root content">
    {children}
    <FeedbackButton />
  </Content>
=======
  <>
    <Helmet>
      <title>Circles</title>
      <meta
        name="description"
        content="Circles UNSW Degree Planner"
      />
      <meta
        name="keywords"
        content="circles, unsw, csesoc, degree, planner, course, plan"
      />
    </Helmet>
    <Content className="app-root content">
      {children}
      <FeedbackButton />
    </Content>
  </>
>>>>>>> dev
);

export default PageTemplate;
