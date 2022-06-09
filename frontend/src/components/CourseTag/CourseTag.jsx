import React from "react";
import { useDispatch } from "react-redux";
import { addTab } from "reducers/courseTabsSlice";
import S from "./styles";

const CourseTag = ({ name }) => {
  const dispatch = useDispatch();

  return (
    <S.Tag onClick={() => dispatch(addTab(name))} className="text tag">
      {name}
    </S.Tag>
  );
};

export default CourseTag;
