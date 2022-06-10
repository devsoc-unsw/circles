import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BorderlessTableOutlined, TableOutlined } from "@ant-design/icons";
import { Button, Divider } from "antd";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import Dashboard from "./Dashboard";
import GridView from "./GridView/GridView";
import TableView from "./TableView";
import "./index.less";

// TODO: dummy data for now
const degreeData = {
  name: "Pearson",
  code: "3767",
  length: 3,
  UOC: 240,
  completed_UOC: 108,
  concentrations: [
    {
      type: "Degree",
      name: "Software Engineering",
      code: "SENGAH",
      UOC: 168,
      completed_UOC: 72,
    },
    {
      type: "Major",
      name: "Statistics",
      code: "MATHT1",
      UOC: 60,
      completed_UOC: 18,
    },
  ],
};

const ProgressionChecker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("grid");

  const {
    programCode, programName, majors, minors,
  } = useSelector((state) => state.degree);

  const [structure, setStructure] = useState({});

  useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      try {
        const majorData = "Major - ".concat(majors);
        const minorData = "Minor - ".concat(minors);
        degreeData.concentrations[0].name = programName;
        if (minors.length === 0) {
          const res = await axios.get(`/programs/getStructure/${programCode}/${majors}`);
          degreeData.code = programCode;
          degreeData.concentrations[1].name = res.data.structure[majorData].name;
          setStructure(res.data.structure);
        } else {
          const res = await axios.get(`/programs/getStructure/${programCode}/${majors}/${minors}`);
          degreeData.code = programCode;
          const minorObj = {
            type: "Minor", name: res.data.structure[minorData].name, code: minors, UOC: 30, completed_UOC: 6,
          };
          degreeData.concentrations.push(minorObj);
          degreeData.concentrations[1].name = res.data.structure[majorData].name;
          setStructure(res.data.structure);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
      setIsLoading(false);
    };
    if (programCode && majors.length > 0) fetchStructure();
  }, [programCode, majors, minors, view]);

  return (
    <PageTemplate>
      <Dashboard isLoading={isLoading} degree={degreeData} />
      <Divider />
      {view === "grid" ? (
        <>
          <Button
            className="viewSwitcher"
            type="primary"
            icon={<TableOutlined />}
            onClick={() => setView("table")}
          >
            Display Table View
          </Button>
          <GridView isLoading={isLoading} structure={structure} />
        </>
      ) : (
        <>
          <Button
            className="viewSwitcher"
            type="primary"
            icon={<BorderlessTableOutlined />}
            onClick={() => setView("grid")}
          >
            Display Grid View
          </Button>
          <TableView isLoading={isLoading} structure={structure} />
        </>
      )}
    </PageTemplate>
  );
};

export default ProgressionChecker;
