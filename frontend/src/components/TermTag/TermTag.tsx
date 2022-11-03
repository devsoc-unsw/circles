import React from 'react';
import S from './styles';

type Props = {
  name: string;
};

const TermTag = ({ name }: Props) => <S.Tag className="text">{name}</S.Tag>;

export default TermTag;
