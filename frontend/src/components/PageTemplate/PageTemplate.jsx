import React from "react";
<<<<<<< HEAD
=======
import { Helmet } from "react-helmet";
<<<<<<< HEAD
>>>>>>> dev
import FeedbackButton from "../FeedbackButton";
=======
import { Layout } from "antd";
import FeedbackButton from "components/FeedbackButton";
>>>>>>> dev

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
