import React from "react";
import { plannerActions } from "../../actions/plannerActions";
import { Typography, DatePicker, Select, Switch, Divider, Button } from "antd";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import {
  exportComponentAsJPEG,
  exportComponentAsPDF,
  exportComponentAsPNG,
} from "react-component-export-image";

const SaveMenu = ({ plannerRef }) => {
  const { Title } = Typography;
  const { Option } = Select;

  const exportFormats = ["png", "jpg"];

  const [format, setFormat] = React.useState("png");

  const download = () => {
    if (format === "png")
      exportComponentAsPNG(plannerRef, {
        fileName: "Term Planner",
      });
    if (format === "jpg")
      exportComponentAsJPEG(plannerRef, {
        fileName: "Term Planner",
      });
  };

  return (
    <div className="settingsMenu" style={{ width: "180px" }}>
      <div className="settingsTitleContainer">
        <Title level={2} class="text" strong className="settingsTitle">
          Export
        </Title>
      </div>
      <div className="settingsEntry">
        <Title level={3} class="text settingsSubtitle">
          File Type
        </Title>
        <Select
          defaultValue="png"
          style={{ width: 70 }}
          onChange={(value) => setFormat(value)}
        >
          {exportFormats.map((format) => (
            <Option value={format}>{format}</Option>
          ))}
        </Select>
      </div>
      <Button style={{ width: "150px" }} onClick={download}>
        Download
      </Button>
    </div>
  );
};

export default SaveMenu;
