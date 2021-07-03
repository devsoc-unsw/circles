import React from "react";

import { Typography, Drawer, Collapse } from "antd";
import { Droppable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { CloseOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const OptionsDrawer = ({ visible, setVisible, courses }) => {
  const { Title } = Typography;
  const { Panel } = Collapse;

  const theme = useSelector((state) => state.theme);
  //   console.log(courses);

  return (
    <Drawer
      placement="left"
      onClose={() => setVisible(false)}
      closeIcon={
        <CloseOutlined style={{ color: theme === "dark" && "white" }} />
      }
      visible={visible}
      getContainer={false}
      bodyStyle={{
        background: theme === "dark" ? "#151718" : "white",
      }}
      mask={false}
      width="25em"
    >
      <Title class="text">Options</Title>
      <Title level={2} class="text">
        Unplanned Courses
      </Title>
      <Collapse className="collapse" ghost={theme === "dark"}>
        <Panel header="Core" key="1">
          <Droppable droppableId="cont" isDropDisabled={true}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ marginBottom: "1em" }}
              >
                <DraggableCourse
                  code="COMP4441"
                  index={0}
                  courseNames={courses}
                  key="COMP4441"
                />
                <DraggableCourse
                  code="COMP3601"
                  index={1}
                  courseNames={courses}
                  key="COMP3601"
                />
                <DraggableCourse
                  code="COMP3131"
                  index={2}
                  courseNames={courses}
                  key="COMP3131"
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Panel>
        <Panel header="Elective" key="2">
          <p>dsfsdf</p>
        </Panel>
        <Panel header="General Education" key="3">
          <p>sdfsdf</p>
        </Panel>
      </Collapse>
      <Title level={2} class="text">
        Number of Years
      </Title>
    </Drawer>
  );
};

export default OptionsDrawer;
