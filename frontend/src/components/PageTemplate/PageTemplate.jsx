import React from "react";
import { Helmet } from "react-helmet";
import { Layout } from "antd";
import FeedbackButton from "components/FeedbackButton";


const { Content } = Layout;

const PageTemplate = ({ children }) => (
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
);

export default PageTemplate;
