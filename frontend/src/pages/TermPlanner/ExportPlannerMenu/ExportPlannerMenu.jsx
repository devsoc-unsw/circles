import React, { useState } from "react";
import {
  exportComponentAsJPEG,
  exportComponentAsPNG,
} from "react-component-export-image";
import {
  Button,
  Divider,
  Radio,
  Typography,
} from "antd";
import CS from "../common/styles";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

const ExportPlannerMenu = ({ plannerRef }) => {
  const { Title } = Typography;

  const exportFormats = ["png", "jpg"];

  const [format, setFormat] = useState("png");

  const download = () => {
    if (format === "png") {
      exportComponentAsPNG(plannerRef, {
        fileName: "Term Planner",
      });
    } else if (format === "jpg") {
      exportComponentAsJPEG(plannerRef, {
        fileName: "Term Planner",
      });
    }
  };

  return (
    <div className="settingsMenu" style={{ width: "180px" }}>
      <div className="settingsTitleContainer">
        <Title level={2} strong className="text settingsTitle">
          Export
        </Title>
        <Divider className="settingsDivider" />
      </div>
      <CS.PopupEntry>
        <Title level={3} className="text settingsSubtitle">
          File Type:
        </Title>
        <Radio.Group onChange={(e) => setFormat(e.target.value)} defaultValue="png">
          {exportFormats.map((form) => (
            <Radio value={form}>{form}</Radio>
          ))}
        </Radio.Group>
      </CS.PopupEntry>
      <Button style={{ width: "150px" }} onClick={download}>
        Download
      </Button>
    </div>
  );
};

export default ExportPlannerMenu;
