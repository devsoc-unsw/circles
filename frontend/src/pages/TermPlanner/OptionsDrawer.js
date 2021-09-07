import React, { useEffect } from "react";
import { updateDegreeLength } from "../../actions/userAction";
import { plannerActions } from "../../actions/plannerActions";
import {
  Typography,
  Drawer,
  Collapse,
  Alert,
  DatePicker,
  Select,
  Switch,
} from "antd";
import { Droppable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";

const OptionsDrawer = ({ visible, setVisible }) => {
  const { Title } = Typography;
  const { Panel } = Collapse;
  const { Option } = Select;
  const theme = useSelector((state) => state.theme);
  const { courses, unplanned, isSummerEnabled } = useSelector((state) => {
    return state.planner;
  });
  const dispatch = useDispatch();
  const sortedUnplanned = sortUnplanned(unplanned, courses);

  function onChange(date, dateString) {
    console.log(date, dateString);
  }

  function handleChange(value) {
    dispatch(updateDegreeLength(value));
  }

  function handleSummerToggle() {
    dispatch(plannerActions("TOGGLE_SUMMER"));
  }

  const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
          message="No more courses..."
          description="You can add more courses via the course selector"
          type="info"
          showIcon
          className="alert"
        />
      ) : (
        <Collapse className="collapse" ghost={theme === "dark"}>
          {Object.keys(sortedUnplanned)
            .sort()
            .map((type, index) => (
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
      <div className="summerToggleBox">
        <Title level={2} class="text" style={{ marginBottom: "0em" }}>
          Summer Term
        </Title>
        <Switch
          defaultChecked={isSummerEnabled}
          onChange={handleSummerToggle}
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      </div>
      <Title level={2} class="text">
        Start Year
      </Title>
      <DatePicker onChange={onChange} picker="year" />
      <Title level={2} class="text" style={{ marginTop: "0.5em" }}>
        Degree Length
      </Title>
      <Select defaultValue="3" style={{ width: 120 }} onChange={handleChange}>
        {years.map((num) => (
          <Option value={num}>{num}</Option>
        ))}
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
