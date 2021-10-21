import React from "react";
import { Typography, Button, Space} from "antd";
import { Skeleton } from "antd";
import CourseComponents from "./CourseComponents.js"
import { map } from "@antv/util";

const ListView = ({ isLoading, degree, progressioncourses}) => {
  const { Title } = Typography;
  console.log(progressioncourses);

  return (
    <>
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          {degree["concentrations"]&&degree["concentrations"].map((concentration) => (
            <div
              className="listPage"
              id={concentration["name"]}
              key={concentration["name"]}
            >
            <Title className="text">{concentration["type"].charAt(0).toUpperCase()+concentration["type"].slice(1)} ({concentration["name"]})</Title>

            <CourseComponents progressioncourses = {progressioncourses} type = {concentration["type"]}/>
            
            </div>
          ))}
        </>
      )}
    </>
  );
};



export default ListView;