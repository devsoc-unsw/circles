import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BorderlessTableOutlined, TableOutlined } from "@ant-design/icons";
import { Button, Divider } from "antd";
import axios from "axios";
<<<<<<< HEAD
<<<<<<< HEAD
import Dashboard from "./Dashboard";
import ListView3 from "./ListView3";
import "./index.less";
import PageTemplate from "../../components/PageTemplate";
=======
import { Divider, Button } from "antd";
import { TableOutlined, BorderlessTableOutlined } from "@ant-design/icons";
=======
import PageTemplate from "components/PageTemplate";
>>>>>>> dev
import Dashboard from "./Dashboard";
import GridView from "./GridView/GridView";
<<<<<<< HEAD
>>>>>>> dev
=======
import TableView from "./TableView";
import "./index.less";
>>>>>>> dev

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
<<<<<<< HEAD

  const {
    programCode, specialisation, minor,
=======
  const [view, setView] = useState("grid");

  const {
    programCode, majors, minors,
>>>>>>> dev
  } = useSelector((state) => state.degree);

  const [structure, setStructure] = useState({});

  useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      try {
<<<<<<< HEAD
        const res = await axios.get(`/programs/getStructure/${programCode}/${specialisation}${minor && `/${minor}`}`);
=======
        const res = await axios.get(`/programs/getStructure/${programCode}/${majors.join("+")}/${minors.join("+")}`);
>>>>>>> dev
        setStructure(res.data.structure);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
      setIsLoading(false);
    };
<<<<<<< HEAD
    if (programCode && specialisation) fetchStructure();
  }, [programCode, specialisation, minor]);
=======
    if (programCode && majors.length > 0) fetchStructure();
  }, [programCode, majors, minors, view]);
>>>>>>> dev

  return (
    <PageTemplate>
      <Dashboard isLoading={isLoading} degree={degreeData} />
<<<<<<< HEAD
      <ListView3
        isLoading={isLoading}
        degree={degreeData}
        progressioncourses={structure}
      />
=======
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
>>>>>>> dev
    </PageTemplate>
  );
};

export default ProgressionChecker;
