import React from "react";
import { Typography, Button, Space} from "antd";
import { Skeleton } from "antd";




const ListView = ({ isLoading, degree, checkercourses}) => {
  const { Title } = Typography;
  // console.log(checkercourses)
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
              <Title className="text">{concentration["name"]}</Title>

              <Title className="text" level={3}>Core Courses</Title> 
                <Space size={[20, 20]} wrap>
                    {checkercourses["corecourses"]&&checkercourses["corecourses"].map((course) => (          
                        <Button className="checkerButton" type="primary">{course["name"]}</Button>
                    ))}                  
                  </Space>
                  <div className="space"/>
              <Title className="text" level={3}>Discipline Electives</Title>
                <Space size={[20, 20]} wrap>
                    {checkercourses["disciplineelectives"]&&checkercourses["disciplineelectives"].map((course) => (          
                        <Button className="checkerButton" type="primary" ghost>{course["name"]}</Button>
                    ))}                  
                  </Space>
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


