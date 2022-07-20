import React, { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "antd";
import useMediaQuery from "hooks/useMediaQuery";
import { toggleTermComplete } from "reducers/plannerSlice";
import DraggableCourse from "../DraggableCourse";
import S from "./styles";

const TermBox = ({
  name, coursesList, termsOffered, dragging,
}) => {
  const term = name.match(/T[0-3]/)[0];

  const { isSummerEnabled, completedTerms, courses } = useSelector((state) => state.planner);
  const { showMarks, theme } = useSelector((state) => state.settings);
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

  const isSmall = useMediaQuery("(max-width: 1400px)");

  return (
    <Droppable droppableId={name} isDropDisabled={isCompleted}>
      {(provided) => (
        <Badge
          count={(
            <S.TermCheckboxWrapper checked={isCompleted}>
              {(
                  !isCompleted
                    ? (
                      <S.IconUnlockFilled
                        onClick={handleCompleteTerm}
                      />
                    ) : (
                      <S.IconLockFilled
                        onClick={handleCompleteTerm}
                      />
                    ) //
                )}
            </S.TermCheckboxWrapper>
            )}
          offset={isSummerEnabled ? [-13, 13] : [-22, 22]}
        >
          <S.TermBoxWrapper
            droppable={isOffered && dragging}
            summerEnabled={isSummerEnabled}
            isSmall={isSmall}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {coursesList.map(
              (code, index) => (
                <DraggableCourse
                  key={`${code}${term}`}
                  code={code}
                  index={index}
                  showMarks={showMarks}
                  term={term}
                />
              ),
            )}
            {provided.placeholder}
            {console.log(theme)}
            <S.UOCBadgeWrapper> 
              <Badge
                className="UOCBadge"
                style={{ backgroundColor: theme === "light" ? "#9254de" : "#51258f", boxShadow: "none" }} 
                size="small"
                count={`${totalUOC} UOC`}
                offset={[0, 0]}
              />
            </S.UOCBadgeWrapper>
          </S.TermBoxWrapper>
        </Badge>
      )}
    </Droppable>
  );
};

export default TermBox;
