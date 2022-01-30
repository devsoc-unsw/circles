import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import ListView3 from "./ListView3";
// import TableView from "./TableView";
import axios from "axios";
import './main.less';
const ProgressionChecker = () => {
  const [degree, setDegree] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState({});

  const fetchDegree = async () => {
    let res = await axios.get("http://localhost:3000/degree.json");
    setDegree(res.data);
    res = await axios.get(`http://localhost:8000/programs/getStructure/3778/${res.data.concentrations[0].code}/${res.data.concentrations[1].code}`);

    setCourses(res.data.structure);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDegree();
  }, []);

  return (
    <>
      <Dashboard isLoading={isLoading} degree={degree}/>
      <ListView3 isLoading={isLoading} degree={degree} progressioncourses={courses}/>
    </>
  );
};

export default ProgressionChecker;


