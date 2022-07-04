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
  // Example groups: Major, Minor, General
  Object.keys(structure).forEach((group) => {
    storeUOC[group] = {
      total: 0,
      curr: 0,
    };
    Object.keys(structure[group]).forEach((subgroup) => {
      if (typeof structure[group][subgroup] !== "string") {
        // case where structure[group][subgroup] gives information on courses in an object
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
        } else {
          // If there is no specified course list for the subgroup, then manually
          // show the added courses on the menu.
          Object.keys(planner.courses).forEach((courseCode) => {
            const courseData = planner.courses[courseCode];
            if (courseData && courseData.type === subgroup) {
              // add UOC to curr
              storeUOC[group].curr += courseData.UOC;
            }
          });
        }
      }
    });
  });

  return (
    <PageTemplate>
      <Dashboard storeUOC={storeUOC} isLoading={isLoading} degree={structure} />
      <Divider />
      <ProgressionCheckerCourses structure={structure} isLoading={isLoading} />
    </PageTemplate>
  );
};

export default ProgressionChecker;
