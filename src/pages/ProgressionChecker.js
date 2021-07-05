import React, { useEffect, useState } from "react";
import Dashboard from "../components/ProgressionChecker/Dashboard";
import ListView from "../components/ProgressionChecker/ListView";
import axios from "axios";

const ProgressionChecker = () => {
  const [degree, setDegree] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchDegree = async () => {
    const res = await axios.get("degree.json");
    setDegree(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    // setTimeout(fetchDegree, 2000);  // testing skeleton
    fetchDegree();
  }, []);

  return (
    <>
      <Dashboard isLoading={isLoading} degree={degree} />
      <ListView isLoading={isLoading} degree={degree} />
    </>
  );
};

export default ProgressionChecker;
