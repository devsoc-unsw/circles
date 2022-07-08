import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BorderlessTableOutlined,
  EyeFilled,
  EyeInvisibleOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { Button, Divider } from "antd";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import Dashboard from "./Dashboard";
import GridView from "./GridView/GridView";
import TableView from "./TableView";
import "./index.less";

const ProgressionCheckerCourses = ({ structure, isLoading }) => {
  const views = {
    GRID: "grid",
    CONCISE: "grid-concise",
    TABLE: "table",
  };
  const defaultView = views.CONCISE;
  const [view, setView] = useState(defaultView);

  return (
    <div>
      {(view === views.GRID || view === views.CONCISE) ? (
        <>
          <Button
            className="viewSwitcher"
            type="primary"
            icon={<TableOutlined />}
            onClick={() => setView(views.TABLE)}
          >
            Display Table View
          </Button>
          <Button
            className="viewSwitcher"
            type="primary"
            icon={view === views.GRID ? <EyeInvisibleOutlined /> : <EyeFilled />}
            onClick={() => setView(view === views.GRID ? views.CONCISE : views.GRID)}
          >
            {view === views.GRID ? "Display Concise Mode" : "Display Full Mode"}
          </Button>
          <GridView isLoading={isLoading} structure={structure} concise={view === views.CONCISE} />
        </>
      ) : (
        <>
          <Button
            className="viewSwitcher"
            type="primary"
            icon={<BorderlessTableOutlined />}
            onClick={() => setView(defaultView)}
          >
            Display Grid View
          </Button>
          <TableView isLoading={isLoading} structure={structure} />
        </>
      )}
    </div>
  );
};

const ProgressionChecker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [structure, setStructure] = useState({});

  const {
    programCode, specs,
  } = useSelector((state) => state.degree);
  const planner = useSelector((state) => state.planner);

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
  }, [programCode, specs]);

  const storeUOC = {};

  // Example groups: Major, Minor, General, Rules
  Object.keys(structure).forEach((group) => {
    storeUOC[group] = {
      total: 0,
      curr: 0,
    };

    // Example subgroup: Core Courses, Computing Electives
    Object.keys(structure[group]).forEach((subgroup) => {
      // Do not include if field is not an object i.e. 'name' field
      if (typeof structure[group][subgroup] === "string") return;

      storeUOC[group].total += structure[group][subgroup].UOC;
      const subgroupStructure = structure[group][subgroup];

      const isRule = subgroupStructure.type && subgroupStructure.type.includes("rule");

      if (subgroupStructure.courses && !isRule) {
        // only consider disciplinary component courses
        Object.keys(subgroupStructure.courses).forEach((courseCode) => {
          if (planner.courses[courseCode]) {
            storeUOC[group].curr += planner.courses[courseCode].UOC;
          }
        });
      }
    });
  });

  return (
    <PageTemplate>
      <Dashboard storeUOC={storeUOC} isLoading={isLoading} structure={structure} />
      <Divider id="divider" />
      <ProgressionCheckerCourses structure={structure} isLoading={isLoading} />
    </PageTemplate>
  );
};

export default ProgressionChecker;
