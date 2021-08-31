import React from "react";
import { Typography, Button, Space} from "antd";
import { Skeleton } from "antd";

const ListView = ({ isLoading, degree, checkercourses }) => {
  const { Title } = Typography;

  return (
    <>
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          {degree["concentrations"].map((concentration) => (
            <div
              className="listPage"
              id={concentration["name"]}
              key={concentration["name"]}
            >
              <Title className="text">{concentration["name"]}</Title>
              
              <Title className="text" level={3}>Core Courses</Title> 
                <Space size={[20, 20]} wrap>
                
                </Space>
              <div className="space"></div>
              <Title className="text" level={3}>Discipline Electives</Title>

              
              <div className="space"></div>
              <Title className="text" level={3}>Free Electives</Title>
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default ListView;


