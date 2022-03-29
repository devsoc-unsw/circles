import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import ListView3 from "./ListView3";
// import TableView from "./TableView";
import axios from "axios";
import "./main.less";
const ProgressionChecker = () => {
  const [degree, setDegree] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState({});

  const fetchDegree = async () => {
    // let res = await axios.get("http://localhost:3000/degree.json");
    // temporary fix to avoid using localhost:3000
    setDegree(degreeData);
    const res = await axios.get(
      `/programs/getStructure/3778/${degreeData.concentrations[0].code}`
    );

    setCourses(res.data.structure);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDegree();
  }, []);

  return (
    <>
      <Dashboard isLoading={isLoading} degree={degree} />
      <ListView3
        isLoading={isLoading}
        degree={degree}
        progressioncourses={courses}
      />
    </>
  );
};

export default ProgressionChecker;

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
