import React, { useState, useEffect } from "react";
import { Skeleton } from "antd";
import { useSelector } from "react-redux";
import { getMostRecentPastTerm } from "../../TermPlanner/validateTermPlanner";
import "./index.less";

const GridView = ({ isLoading, structure }) => {
  return (
    <div className="gridViewContainer">
      {isLoading ? (
        <Skeleton />
      ) : (
        <button />
      )}
    </div>
  );
}

export default GridView;