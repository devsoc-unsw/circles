import React, { useState } from "react";
import {
  exportComponentAsJPEG,
  exportComponentAsPNG,
} from "react-component-export-image";
import { Button, Radio } from "antd";
import CS from "../common/styles";
import S from "./styles";

type Props = {
  plannedRef: any
};

const ExportPlannerMenu = ({ plannerRef }: Props) => {
  const exportFormats = ["png", "jpg"];
  const exportFields = { fileName: "Term Planner" };

  const [format, setFormat] = useState("png");

  const download = () => {
    if (format === "png") {
      exportComponentAsPNG(plannerRef, exportFields);
    } else if (format === "jpg") {
      exportComponentAsJPEG(plannerRef, exportFields);
    }
  };

  return (
    <S.Wrapper style={{ width: "240px" }}>
      <CS.MenuHeader>Export</CS.MenuHeader>
      <CS.MenuDivider />
      <CS.PopupEntry>
        <CS.MenuText>File Type</CS.MenuText>
        <Radio.Group onChange={(e) => setFormat(e.target.value)} defaultValue="png">
          {exportFormats.map((form) => (
            <Radio value={form} className="text">{form}</Radio>
          ))}
        </Radio.Group>
      </CS.PopupEntry>
      <Button style={{ width: "150px" }} onClick={download}>
        Download
      </Button>
    </S.Wrapper>
  );
};

export default ExportPlannerMenu;
