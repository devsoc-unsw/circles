import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BorderlessTableOutlined, EyeInvisibleOutlined, TableOutlined } from "@ant-design/icons";
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
  const [view, setView] = useState("grid");

  return (
    <div>
      {(view === "grid" || view === "grid-concise") ? (
        <>
          <Button
            className="viewSwitcher"
            type="primary"
            icon={<TableOutlined />}
            onClick={() => setView("table")}
          >
            Display Table View
          </Button>
          <Button
            className="viewSwitcher"
            type="primary"
            icon={<EyeInvisibleOutlined />}
            onClick={() => setView(view === "grid" ? "grid-concise" : "grid")}
          >
            {view === "grid" ? "Display Concise Mode" : "Display Normal Mode"}
          </Button>
          <GridView isLoading={isLoading} structure={structure} concise={view === "grid-concise"} />
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
    </div>
  );
};

const ProgressionChecker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [structure, setStructure] = useState({});

  const {
    programCode, specs,
  } = useSelector((state) => state.degree);

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
      <Dashboard isLoading={isLoading} degree={degreeData} />
      <Divider />
      <ProgressionCheckerCourses structure={structure} isLoading={isLoading} />
    </PageTemplate>
  );
};

export default ProgressionChecker;
