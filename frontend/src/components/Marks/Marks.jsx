/* eslint-disable */

import React, { useState, useSelector }  from "react";
import KebabMenu from "../KebabMenu";
import { Typography } from "antd";

import "./index.less";

const Marks = ({ courseCode }) => {

  // TODO: This Component Should now take in courseCode instead of 
  // the mark - pick up the courseMark from the state
  // const mark = useSelector((state) => state);
  // console.log("mark:", mark);

  const { Text } = Typography;
  const mark = undefined;

  // ! REMOVE TRUE
  // showMarks = true;

  return (
    <div>
      <Text strong className="text">
        Mark: 
      </Text>
      <Text classnmae="text marks-val">
        {(mark) ? mark : " N/A"}
      </Text>
    </div >
  )

  // return (
  //   <div className="marks-cont">
  //     STILL AHHHHH
  //     <Text strong className="text">
  //       Mark:
  //     </Text>
  //     <Text className="text marks-val">
  //       {(mark) ? mark : "Unavailable"}
  //     </Text>
  //   </div>
  // )
  
  // return (showMarks) ? (
  //   <div className="marks-cont">
  //     AHHHHHHHHH
  //     <Text strong className="text">
  //       Mark:
  //     </Text>
  //     <Text className="text marks-val">
  //       {(mark) ? mark : "N/A"}
  //     </Text>

  //     <KebabMenu />
  //   </div>
  // ) : null;
};

export default Marks;
