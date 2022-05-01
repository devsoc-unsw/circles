import React, { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import ListView3 from "./ListView3";
import "./main.less";
import PageTemplate from "../../components/PageTemplate";

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
  const [degree, setDegree] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState({});

  const fetchDegree = async () => {
    setDegree(degreeData);
    const res = await axios.get(
      `/programs/getStructure/3778/${degreeData.concentrations[0].code}`,
    );

    setCourses(res.data.structure);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDegree();
  }, []);

  return (
    <PageTemplate>
      <Dashboard isLoading={isLoading} degree={degree} />
      <ListView3
        isLoading={isLoading}
        degree={degree}
        progressioncourses={courses}
      />
    </PageTemplate>
  );
};

export default ProgressionChecker;
