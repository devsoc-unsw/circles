import React from "react";
import { Droppable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { useSelector, useDispatch } from "react-redux";
import { Badge } from "antd";
import {
  RiCheckboxBlankCircleFill,
  RiCheckboxCircleFill,
  RiLock2Fill,
} from "react-icons/ri";
import { BsLockFill } from "react-icons/bs";
import { IconContext } from "react-icons";
import { plannerActions } from "../../actions/plannerActions";

function TermBox({ name, courses, termsOffered, isDragging }) {
  const term = name.match(/t[0-3]/)[0];

  const { isSummerEnabled, completedTerms } = useSelector((state) => {
    return state.planner;
  });

  const dispatch = useDispatch();
  const handleCompleteTerm = () => {
    dispatch(plannerActions("TOGGLE_TERM_COMPLETE", name));
  };

  //   console.log(completedTerms.get(name));
  const isCompleted = completedTerms.get(name);

  const isDropAllowed = termsOffered.includes(term) && !isCompleted;

  return (
    <Droppable droppableId={name} isDropDisabled={!isDropAllowed}>
      {(provided) => (
        <Badge
          count={
            <RiCheckboxCircleFill
              size="1.5em"
              className={`termCheckbox ${isCompleted && "checkedTerm"}`}
              onClick={handleCompleteTerm}
            />
          }
          offset={[-22, 22]}
        >
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`termBox ${
              isDropAllowed && isDragging && "droppable "
            } ${isSummerEnabled && "summerTermBox"} `}
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
