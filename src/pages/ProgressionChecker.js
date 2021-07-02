import React, { useEffect, useState } from "react";
import Dashboard from "../components/ProgressionChecker/Dashboard";
import ListView from "../components/ProgressionChecker/ListView";
import axios from "axios";

const ProgressionChecker = () => {
  const [degree, setDegree] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchDegree = async () => {
    const res = await axios.get("degree.json");
    setDegree(res.data);
    setLoading(false);
  };

  useEffect(() => {
    // setTimeout(fetchDegree, 2000);  // testing skeleton
    fetchDegree();
  }, []);

  return (
    <>
      <Dashboard loading={loading} degree={degree} />
      <ListView loading={loading} degree={degree} />
    </>
  );
};

export default ProgressionChecker;
