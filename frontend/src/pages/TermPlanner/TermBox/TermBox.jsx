import React, { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { LockFilled, UnlockFilled } from "@ant-design/icons";
import { Badge } from "antd";
import { toggleTermComplete } from "reducers/plannerSlice";
import DraggableCourse from "../DraggableCourse";
import "./index.less";

const TermBox = ({
  name, coursesList, termsOffered, isDragging, showMarks,
}) => {
  const term = name.match(/T[0-3]/)[0];

  const { isSummerEnabled, completedTerms, courses } = useSelector((state) => state.planner);
  const [totalUOC, setTotalUOC] = useState(0);
  const dispatch = useDispatch();
  const handleCompleteTerm = () => {
    dispatch(toggleTermComplete(name));
  };

  useEffect(() => {
    setTotalUOC(0);
    let count = 0;
    const key = Object.keys(courses);
    key.forEach((i) => {
      if (coursesList.includes(i)) {
        count += courses[i].UOC;
        setTotalUOC(count);
      }
    });
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
