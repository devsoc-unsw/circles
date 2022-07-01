import React from "react";
import S from "./styles";

const TermTag = ({ name }) => (
  <S.Tag className="text">
    {name}
  </S.Tag>
);

export default TermTag;
