import React from "react";
import { Typography, Button, Space} from "antd";
import { Skeleton } from "antd";
import { map } from "@antv/util";

const ListView = ({ isLoading, degree, progressioncourses}) => {
  const { Title } = Typography;
    
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
            <Title className="text">{concentration["type"]} ({concentration["name"]})</Title>

            {Object.entries(progressioncourses["Major"]&&progressioncourses["Major"]).map(([key, value]) => (       
                // console.log(Object.keys(value["courses"]), Object.values(value["courses"]))
                <div>
                <Title className="text" level={3} key={key}>{key}</Title>
                <Title className="text" level={5} key={key}>{value["uoc"]} UOC of the following courses</Title>

                <Space size={[20, 20]} wrap>
                    {Object.entries(value["courses"]).map(([coursekey, coursevalue]) => (
                        <Button className="checkerButton" type="primary" key={coursekey}>
                            {coursekey}: {coursevalue}
                        </Button>
                    ))}
                </Space>
                <div className="space"/>
                </div>
            ))}
            
            </div>
          ))}
        </>
      )}
    </>
  );
};



export default ListView;