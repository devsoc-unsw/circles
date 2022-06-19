import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { LockFilled, UnlockFilled } from "@ant-design/icons";
import { Badge } from "antd";
import { toggleTermComplete } from "reducers/plannerSlice";
import DraggableCourse from "../DraggableCourse";
import "./index.less";

const TermBox = ({
  name, courses, termsOffered, isDragging, showMarks,
}) => {
  const term = name.match(/T[0-3]/)[0];

  const { isSummerEnabled, completedTerms } = useSelector((state) => state.planner);

  const dispatch = useDispatch();
  const handleCompleteTerm = () => {
    dispatch(toggleTermComplete(name));
  };

  const isCompleted = !!completedTerms[name];

  const isOffered = termsOffered.includes(term) && !isCompleted;

  return (
    <Droppable droppableId={name} isDropDisabled={isCompleted}>
      {(provided) => (
        <Badge
          count={(
            <div className={`termCheckboxContainer ${isCompleted && "checkedTerm"}`}>
              {(
                !isCompleted
                  ? (
                    <UnlockFilled
                      className="termCheckbox"
                      onClick={handleCompleteTerm}
                    />
                  ) : (
                    <LockFilled
                      className="termCheckbox"
                      onClick={handleCompleteTerm}
                    />
                  )
              )}
            </div>
          )}
          offset={isSummerEnabled ? [-13, 13] : [-22, 22]}
        >
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`termBox ${isOffered && isDragging && "droppable "
            } ${isSummerEnabled && "summerTermBox"} `}
          >
            {courses.map(
              (code, index) => (
                <DraggableCourse
                  key={`${code}${term}`}
                  code={code}
                  index={index}
                  showMarks={showMarks}
                  term={term || ""}
                />
              ),
            )}
            {provided.placeholder}
          </ul>
        </Badge>
      )}
    </Droppable>
  );
};

export default TermBox;
