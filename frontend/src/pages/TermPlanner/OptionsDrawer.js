import React, { useEffect } from "react";
import { plannerActions } from "../../actions/plannerActions";
import { Typography, Drawer, Collapse, Alert, DatePicker, Select } from "antd";
import { Droppable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { CloseOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const OptionsDrawer = ({ visible, setVisible }) => {
  const { Title } = Typography;
  const { Panel } = Collapse;
  const { Option } = Select;
  const theme = useSelector((state) => state.theme);
  const { courses, unplanned } = useSelector((state) => {
    return state.planner;
  });

  const sortedUnplanned = sortUnplanned(unplanned, courses);

  function onChange(date, dateString) {
	console.log(date, dateString);
  }
  
  function handleChange(value) {
	console.log(`selected ${value}`);
  }

  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

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
      {Object.keys(sortedUnplanned).length === 0 ? (
        <Alert
          message="Oh!"
          description="It looks like you don't have any more courses to add to your term planner. "
          type="warning"
          showIcon
          className="alert"
        />
      ) : (
        <Collapse className="collapse" ghost={theme === "dark"}>
          {Object.keys(sortedUnplanned).map((type, index) => (
            <Panel header={type} key={index}>
              <Droppable droppableId={type} isDropDisabled={true}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="panel"
                  >
                    {sortedUnplanned[type].map((code, index) => (
                      <DraggableCourse code={code} index={index} key={code} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Panel>
          ))}
        </Collapse>
      )}
	   <Title level={2} class="text">
        Start Year
      </Title>  
	  <DatePicker onChange={onChange} picker="year"/>
	  <Title level={2} class="text" style={{marginTop:"0.5em"}}>
        Degree Length
      </Title>
	  <Select defaultValue="3" style={{ width: 120 }} onChange={handleChange}>
		  {years.map((num)=> <Option value={num}>{num}</Option>)  }
    </Select>
    </Drawer>
  );
};

// create separate array for each type
// e.g. courseTypes = { Core: ["COMP1511", "COMP2521"], Elective: ["COMP6881"] }
const sortUnplanned = (unplanned, courses) => {
  if (unplanned == null) return {};
  let courseTypes = {};
  unplanned.forEach((code) => {
    const type = courses.get(code)["type"];
    if (!courseTypes.hasOwnProperty(type)) {
      courseTypes[type] = [code];
    } else {
      courseTypes[type].push(code);
    }
  });
  return courseTypes;
};

export default OptionsDrawer;
