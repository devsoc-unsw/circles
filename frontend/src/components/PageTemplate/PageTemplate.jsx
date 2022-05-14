import { Layout } from "antd";
import React from "react";
import FeedbackButton from "../FeedbackButton";

const { Content } = Layout;

const PageTemplate = ({ children }) => {
  // light mode is always on
  document.body.classList.add("light");

  return (
    <Content className="app-root content">
      {children}
      <FeedbackButton />
    </Content>
  );
};

export default PageTemplate;
