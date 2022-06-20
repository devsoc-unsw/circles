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
      type: "Program",
      name: "Software Engineering",
      code: "SENGAH",
      UOC: 0,
      completedUOC: 0,
    },
    {
      type: "Major",
      name: "Statistics",
      code: "MATHT1",
      UOC: 0,
      completedUOC: 0,
    },
    {
      type: "Minor",
      name: "Marine Science",
      code: "MSCIM1",
      UOC: 0,
      completedUOC: 0,
    },
  ],
};

const ProgressionChecker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("grid");

  const {
    programCode, programName, majors, minors,
  } = useSelector((state) => state.degree);
  const planner = useSelector((state) => state.planner);

  const [structure, setStructure] = useState({});
  const majorData = "Major - ".concat(majors);
  const minorData = "Minor - ".concat(minors);
  degreeData.concentrations[0].name = programName;
  degreeData.concentrations[0].code = programCode;
  degreeData.concentrations[1].type = majorData;
  degreeData.concentrations[1].code = majors;

  useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      try {
        if (degreeData.concentrations.length === 3) degreeData.concentrations.pop();
        if (minors.length === 0) {
          const res = await axios.get(`/programs/getStructure/${programCode}/${majors}`);
          degreeData.code = programCode;
          degreeData.concentrations[1].name = res.data.structure[majorData].name;
          setStructure(res.data.structure);
        } else {
          const res = await axios.get(`/programs/getStructure/${programCode}/${majors}/${minors}`);
          degreeData.code = programCode;
          degreeData.concentrations[0].name = programName;
          degreeData.concentrations[1].name = res.data.structure[majorData].name;
          const minorObj = {
            type: "Minor",
            name: res.data.structure[minorData].name,
            code: minors,
            UOC: 0,
            completedUOC: 0,
          };
          degreeData.concentrations.push(minorObj);
          degreeData.concentrations[2].type = minorData;
          degreeData.concentrations[1].type = majorData;
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

  const storeUoc = {};

  Object.keys(structure).forEach((group) => {
    storeUoc[group] = {};
    let totalUoc = 0;
    let completedUOC = 0;
    Object.keys(structure[group]).forEach((sub) => {
      if (typeof structure[group][sub] !== "string") {
        totalUoc += structure[group][sub].UOC;
        if (structure[group][sub].courses) {
          Object.keys(structure[group][sub].courses).forEach((code) => {
            if (planner.courses[code]) {
              completedUOC += planner.courses[code].UOC;
            }
          });
        } else {
          Object.keys(planner.courses).forEach((code) => {
            if (planner.courses[code].type === "Uncategorised") {
              completedUOC += planner.courses[code].UOC;
            }
          });
        }
      }
    });

    storeUoc[group] = {
      total_UOC: totalUoc,
      completed_UOC: completedUOC,
    };
  });

  let calTotalUOC = 0;
  let calCompletedUOC = 0;
  Object.keys(storeUoc).forEach((group) => {
    calTotalUOC += storeUoc[group].total_UOC;
    calCompletedUOC += storeUoc[group].completed_UOC;
    degreeData.concentrations.forEach((i) => {
      if (i.type === group) {
        i.UOC = storeUoc[group].total_UOC;
        i.completedUOC = storeUoc[group].completed_UOC;
      }
    });
  });
  degreeData.UOC = calTotalUOC;
  degreeData.concentrations[0].UOC = calTotalUOC;
  degreeData.concentrations[0].completedUOC = calCompletedUOC;
  degreeData.completed_UOC = calCompletedUOC;

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
