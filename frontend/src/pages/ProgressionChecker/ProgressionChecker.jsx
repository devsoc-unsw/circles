import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { scroller } from "react-scroll";
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

// TODO: dummy data for now
const degreeData = {
  name: "Pearson",
  code: "3767",
  length: 3,
  UOC: 240,
  completed_UOC: 108,
  concentrations: [
    {
      type: "Specialisation",
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
    {
      type: "Minor",
      name: "Marine Science",
      code: "MSCIM1",
      UOC: 36,
      completed_UOC: 6,
    },
  ],
};

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

  const clickArrow = () => {
    scroller.scrollTo("divider", {
      duration: 1500,
      smooth: true,
    });
  };
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

  return (
    <PageTemplate>
      <Dashboard isLoading={isLoading} degree={degreeData} clickArrow={clickArrow} />
      <Divider id="divider" />
      <ProgressionCheckerCourses structure={structure} isLoading={isLoading} />
    </PageTemplate>
  );
};

export default ProgressionChecker;
