import { Layout } from "antd";
import React from "react";
import FeedbackButton from "../FeedbackButton";

const { Content } = Layout;

const PageTemplate = ({ children }) => (
  <Content className="app-root content">
    {children}
    <FeedbackButton />
  </Content>
);

export default PageTemplate;
