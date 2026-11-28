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
      ? '1 student in your degree has this course in their plan'
      : `${count} students in your degree have this course in their plan`;

  // Focusable with a full text label, so keyboard and screen reader users get
  // the same information as the hover tooltip.
  return (
    <Tooltip placement="top" title={tooltip} trigger={['hover', 'focus']}>
      {withLabel ? (
        <S.Badge
          data-testid="popularity-badge"
          tabIndex={0}
          aria-label={`Popular course: ${tooltip}`}
        >
          <FireFilled aria-hidden style={{ fontSize: '1em' }} />
          Popular course
        </S.Badge>
      ) : (
        <S.Flame
          data-testid="popularity-flame"
          tabIndex={0}
          role="img"
          aria-label={`Popular: ${tooltip}`}
        >
          <FireFilled aria-hidden style={{ fontSize: '1em' }} />
        </S.Flame>
      )}
    </Tooltip>
  );
};

export default PopularityTag;
