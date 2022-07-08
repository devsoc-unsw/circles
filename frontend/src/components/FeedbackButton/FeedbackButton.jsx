import React from "react";
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { BugOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import Link from "next/link";
import { FEEDBACK_LINK } from "config/constants";
import S from "./styles";

const FeedbackButton = () => {
  const theme = useSelector((store) => store.theme);
  // Feedback form
  const isTablet = useMediaQuery({ maxWidth: 1000 });

  // Move this to the drawer if the screen is too small
  return (isTablet) ? <div />
    : (
      <S.FeedbackBtnWrapper>
        <Tooltip title="Report a bug!">
          <Link href={FEEDBACK_LINK} passHref>
            <Button
              shape="circle"
              ghost={theme === "dark"}
              icon={<BugOutlined />}
              size="large"
            />
          </Link>
        </Tooltip>
      </S.FeedbackBtnWrapper>
    );
};

export default FeedbackButton;
