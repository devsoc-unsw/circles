import React, { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { LockFilled, UnlockFilled } from "@ant-design/icons";
import { Badge } from "antd";
import { toggleTermComplete } from "reducers/plannerSlice";
import DraggableCourse from "../DraggableCourse";
import "./index.less";

const TermBox = ({
  name, coursesList, termsOffered, isDragging,
}) => {
  const term = name.match(/T[0-3]/)[0];

  const { isSummerEnabled, completedTerms, courses } = useSelector((state) => state.planner);
  const { showMarks } = useSelector((state) => state.settings);
  const [totalUOC, setTotalUOC] = useState(0);
  const dispatch = useDispatch();
  const handleCompleteTerm = () => {
    dispatch(toggleTermComplete(name));
  };

  useEffect(() => {
    let uoc = 0;
    Object.keys(courses).forEach((c) => {
      if (coursesList.includes(c)) uoc += courses[c].UOC;
    });
    setTotalUOC(uoc);
  }, [coursesList]);

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
            {coursesList.map(
              (code, index) => (
                <DraggableCourse
                  key={code}
                  code={code}
                  index={index}
                  showMarks={showMarks}
                />
              ),
            )}
            {provided.placeholder}
            <div className="uocCounter">
              <Badge style={{ backgroundColor: "#9254de" }} size="small" count={`${totalUOC} UOC`} offset={isSummerEnabled ? [13, -13] : [22, -14]} />
            </div>
          </ul>
        </Badge>
      )}
    </Droppable>
  );
};

export default TermBox;
