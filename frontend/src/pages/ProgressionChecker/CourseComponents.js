import React from "react";
import { Button, Space, Typography} from "antd";

function CourseComponents({progressioncourses, type}) {
    console.log(type)
    const { Title } = Typography;

    return (
        <div>
            {Object.entries(progressioncourses[type]&&progressioncourses[type]).map(([key, value]) => (       
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
    )
}

export default CourseComponents
