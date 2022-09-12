import React, { MouseEventHandler } from 'react';
import { Tag as antdTag } from 'antd';
import styled, { css } from 'styled-components';

type Props = {
  name: string;
  onClick?: MouseEventHandler<HTMLSpanElement>;
};

const Tag = styled(antdTag)`
  margin-bottom: 8px;

  ${({ theme }) => theme.courseTag && css`
    background: ${theme.courseTag.backgroundColor};
  `}

  &.clickable:hover {
    cursor: pointer;
  }
`;

const CourseTag = ({ name, onClick }: Props) => (
  (onClick !== undefined)
    ? <Tag className="text clickable" onClick={onClick}>{name}</Tag>
    : <Tag className="text">{name}</Tag>
);

export default CourseTag;
