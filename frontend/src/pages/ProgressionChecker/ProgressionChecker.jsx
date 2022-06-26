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

const ProgressionChecker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("grid");

  const {
    programCode, specs,
  } = useSelector((state) => state.degree);
  const planner = useSelector((state) => state.planner);

  const [structure, setStructure] = useState({});

  useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      try {
        const res = await axios.get(`/programs/getStructure/${programCode}/${specs.join("+")}`);
        setStructure(res.data.structure);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
      setIsLoading(false);
    };
    if (programCode && specs.length > 0) fetchStructure();
  }, [programCode, specs, view]);

  const storeUoc = {};
  // Example groups: Major, Minor, General
  Object.keys(structure).forEach((group) => {
    storeUoc[group] = {};
    let totalUoc = 0;
    let completedUOC = 0;
    Object.keys(structure[group]).forEach((sub) => {
      if (typeof structure[group][sub] !== "string" && sub !== "Maximum Level 1 Electives UOC") {
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
  });
  storeUoc.total_UOC = calTotalUOC;
  storeUoc.completed_UOC = calCompletedUOC;
  return (
    <PageTemplate>
      <Dashboard storeUoc={storeUoc} isLoading={isLoading} degree={structure} />
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
