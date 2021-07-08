import React from "react";

import { Typography, Drawer, Collapse, Alert, Button } from "antd";
import { Droppable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { CloseOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const OptionsDrawer = ({ visible, setVisible, unplanned, data }) => {
  const { Title } = Typography;
  const { Panel } = Collapse;

  const theme = useSelector((state) => state.theme);
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
      width="25em"
      mask={false}
    >
      <Title class="text">Options</Title>
      <Title level={2} class="text">
        Unplanned Courses
      </Title>
      {Object.keys(unplanned).length === 0 ? (
        <Alert
          message="Oops!" // might need to change this
          description="It looks like you haven't added any courses to your term planner. Please do so in the course selector."
          type="warning"
          showIcon
          className="alert"
        />
      ) : (
        <Collapse className="collapse" ghost={theme === "dark"}>
          {Object.keys(unplanned).map((type, index) => (
            <Panel header={type} key={index}>
              <Droppable droppableId={type} isDropDisabled={true}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="panel"
                  >
                    {unplanned[type].map((code, index) => (
                      <DraggableCourse
                        code={code}
                        index={index}
                        courseNames={data["courses"]}
                        key={code}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Panel>
          ))}
        </Collapse>
      )}
    </Drawer>
  );
};

export default OptionsDrawer;
