import React from "react";
import { Helmet } from "react-helmet";
import { Layout } from "antd";
import FeedbackButton from "components/FeedbackButton";
import Header from "components/Header";

const { Content } = Layout;

const PageTemplate = ({ children, showHeader = true }) => (
  <Layout>
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
    { showHeader && <Header />}
    <Content className="app-root content">
      {children}
      <FeedbackButton />
    </Content>
  </Layout>
);

export default PageTemplate;
