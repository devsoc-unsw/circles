import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import ListView from "./ListView";
import axios from "axios";
import './main.less';
const ProgressionChecker = () => {
  const [degree, setDegree] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState({});

  const fetchDegree = async () => {
    let res = await axios.get("degree.json");
    setDegree(res.data);
    res = await axios.get("progressioncourses.json");
    console.log(res.data)
    setCourses(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    // setTimeout(fetchDegree, 2000);  // testing skeleton
    fetchDegree();
    // fetchCourses();
  }, []);

  return (
    <>
      <Dashboard isLoading={isLoading} degree={degree}/>
      <ListView isLoading={isLoading} degree={degree} checkercourses={courses}/>
    </>
  );
};

export default ProgressionChecker;


