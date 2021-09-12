import React from "react";
import { Droppable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { useSelector } from "react-redux";
import { Badge } from "antd";
import {
  RiCheckboxBlankCircleFill,
  RiCheckboxCircleFill,
  RiLock2Fill,
} from "react-icons/ri";
import { BsLockFill } from "react-icons/bs";
import { IconContext } from "react-icons";

function TermBox({ name, courses, termsOffered, isDragging }) {
  const term = name.match(/t[0-3]/)[0];
  const isDropAllowed = termsOffered.includes(term);

  const { isSummerEnabled } = useSelector((state) => {
    return state.planner;
  });

  const [isChecked, setIsChecked] = React.useState(false);
  const handleCompleteTerm = () => {
    setIsChecked(!isChecked);
  };

  return (
    <Droppable droppableId={name} isDropDisabled={!isDropAllowed}>
      {(provided) => (
        <Badge
          count={
            <BsLockFill
              size="1.5em"
              //   color="#d6b9f9"
              //   color="#e4e3e3"
              className={`checkboxTerm ${isChecked && "checkedTerm"}`}
              onClick={handleCompleteTerm}
              style={{ paddingBottom: "0.2em" }} // lock
            />
          }
          //   offset={[-22, 20]} // top right
          offset={[-23, 19]} // lock
        >
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`termBox ${
              isDropAllowed && isDragging && "droppable "
            } ${isSummerEnabled && "summerTermBox"}`}
          >
            {courses.map((code, index) => {
              // const warning = courses.get(code)["warning"];
              return (
                <DraggableCourse
                  key={code}
                  code={code}
                  index={index}
                  // warning={warning}
                />
              );
            })}
            {provided.placeholder}
          </ul>
        </Badge>
      )}
    </Droppable>
  );
}

export default TermBox;
