import React from "react";
import { Layout } from "antd";
import FeedbackButton from "components/FeedbackButton";

const { Content } = Layout;

const PageTemplate = ({ children }) => (
  <Content className="app-root content">
    {children}
    <FeedbackButton />
  </Content>
);

export default PageTemplate;
