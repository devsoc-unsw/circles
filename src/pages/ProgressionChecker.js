import React from "react";
import Dashboard from "../components/ProgressionChecker/Dashboard";
import ListView from "../components/ProgressionChecker/ListView";
function ProgressionChecker() {
  return (
    <>
      <Dashboard />
      <ListView title="Software Engineering" />
      <ListView title="Bioinformatics" />
      <ListView title="Marine Science" />
    </>
  );
}

export default ProgressionChecker;
