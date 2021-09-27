import React from "react";
import { Typography, Button, Space} from "antd";
import { Skeleton } from "antd";

const ListView = ({ isLoading, degree, progressioncourses}) => {
  const { Title } = Typography;
  // console.log(progressioncourses)
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

            {progressioncourses["major"]&&progressioncourses["major"].map((group) => (          
                <div className="space">
                <Title className="text" level={3}>{group}</Title>

                {progressioncourses["uoc"]&&progressioncourses["uoc"].map((group) => (          
                    <div className="space">
                    <Title className="text" level={5}>{group["uoc"]} UOC of the following courses</Title>
                    
                    {progressioncourses["courses"]&&progressioncourses["courses"].map((course) => (          
                        <Space size={[20, 20]} wrap>
                        <Button className="checkerButton" type="primary">{course["courses"]}</Button>
                        </Space>
                    ))}                  
                    </div>
                ))}
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