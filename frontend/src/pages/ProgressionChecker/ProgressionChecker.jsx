import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Divider, Button } from "antd";
import { TableOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import Dashboard from "./Dashboard";
import "./index.less";
import PageTemplate from "../../components/PageTemplate";
import TableView from "./TableView";
import GridView from "./GridView/GridView";

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

const ProgressionChecker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("grid");

  const {
    programCode, majors, minors,
  } = useSelector((state) => state.degree);

  const [structure, setStructure] = useState({});

  useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      try {
        const res = await axios.get(`/programs/getStructure/${programCode}/${majors.join("+")}${minors && `/${minors.join("+")}`}`);
        setStructure(res.data.structure);
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
