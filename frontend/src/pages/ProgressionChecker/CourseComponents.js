import React from "react";
import { Button, Space, Typography} from "antd";

function CourseComponents({progressioncourses, type}) {
    const { Title } = Typography;
    return (
        <div>
            {progressioncourses[type] &&
                Object.entries(progressioncourses[type]).map(([key, value]) => (
                key !== "name" &&
                <div>
                <Title className="text" level={3} key={key}>{key}</Title>
                <Title className="text" level={5} key={key}>{value.UOC} UOC of the following courses</Title>

                <Space size={[20, 20]} wrap>
                    {
                        Object.entries(value.courses).map(([coursekey, coursevalue]) => (
                            <Button className="checkerButton" type="primary" key={coursekey}>
                                {coursekey}: {coursevalue}
                            </Button>
                        ))
                    }
                </Space>
                </div>
            ))}
        </div>
    )
}

export default CourseComponents
