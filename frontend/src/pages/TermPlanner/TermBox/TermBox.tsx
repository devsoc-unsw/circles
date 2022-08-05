import React, { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { LockFilled, UnlockFilled } from "@ant-design/icons";
import { Badge } from "antd";
import { useTheme } from "styled-components";
import { RootState } from "config/store";
import useMediaQuery from "hooks/useMediaQuery";
import { toggleTermComplete } from "reducers/plannerSlice";
import DraggableCourse from "../DraggableCourse";
import S from "./styles";

type Props = {
  name: string
  coursesList: string[]
  termsOffered: string[]
  dragging: boolean
};

const TermBox = ({
  name, coursesList, termsOffered, dragging,
}: Props) => {
  const term = name.match(/T[0-3]/)[0];
  const theme = useTheme();

  const {
    isSummerEnabled,
    completedTerms,
    courses,
  } = useSelector((state: RootState) => state.planner);
  const { showMarks } = useSelector((state: RootState) => state.settings);
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

  const iconStyle = {
    fontSize: "12px",
    color: theme.termCheckbox.color,
  };

  const uocBadgeStyle = {
    backgroundColor: theme.uocBadge.backgroundColor,
    boxShadow: "none",
  };
  return (
    <Droppable droppableId={name} isDropDisabled={isCompleted}>
      {(provided) => (
        <Badge
          count={(
            <S.TermCheckboxWrapper checked={isCompleted}>
              {(
                  !isCompleted
                    ? (
                      <UnlockFilled
                        style={iconStyle}
                        onClick={handleCompleteTerm}
                      />
                    ) : (
                      <LockFilled
                        style={iconStyle}
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
            <S.UOCBadgeWrapper>
              <Badge
                style={uocBadgeStyle}
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
