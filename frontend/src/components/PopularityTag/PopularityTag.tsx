import React from 'react';
import { FireFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import S from './styles';

type Props = {
  count: number;
  /** Show the "Popular course" pill instead of a bare flame. */
  withLabel?: boolean;
};

/**
 * Marks electives that are popular with students on the same program and
 * specialisation. Hovering reveals how many students that is.
 */
const PopularityTag = ({ count, withLabel }: Props) => {
  const tooltip =
    count === 1
      ? '1 student has this course in their plan'
      : `${count} students have this course in their plan`;

  return (
    <Tooltip placement="top" title={tooltip}>
      {withLabel ? (
        <S.Badge data-testid="popularity-badge">
          <FireFilled style={{ fontSize: '1em' }} />
          Popular course
        </S.Badge>
      ) : (
        <S.Flame data-testid="popularity-flame">
          <FireFilled style={{ fontSize: '1em' }} />
        </S.Flame>
      )}
    </Tooltip>
  );
};

export default PopularityTag;
