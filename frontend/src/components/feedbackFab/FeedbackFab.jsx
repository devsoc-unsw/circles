import React from 'react';
import { Button, Tooltip } from 'antd';
import { BugOutlined } from "@ant-design/icons";
import "./feedbackFab.less";

export const FeedbackFab = () => {
    // Feedback form 
    const FORM_LINK = "https://forms.gle/b3b8CrZsz9h5sZ3v9"
    return (
        <div className="feedbackFab-root">
            <Tooltip title="Report a bug!">
                <Button shape="circle" 
                    icon={<BugOutlined />} size="large"
                    onClick={() => window.open(FORM_LINK, '_blank')}
                />
            </Tooltip>
        </div>
    )
}