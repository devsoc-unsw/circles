import React, { useEffect, useRef, useState } from 'react';
import { Draggable, DraggingStyle, NotDraggingStyle } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTheme } from 'styled-components';
import type { RootState } from 'config/store';
import useIntersectionObserver from 'hooks/useIntersectionObserver';
import { removeTab, setActiveTab } from 'reducers/courseTabsSlice';
import S from './styles';

type Props = {
  tabName: string
  index: number
};

const DraggableTab = ({ tabName, index }: Props) => {
  const [scrolledTo, setScrolledTo] = useState(false);
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const tabInView = useIntersectionObserver(ref);
  const { active } = useSelector((state: RootState) => state.courseTabs);
  const theme = useTheme();

  const getDraggableStyle = (style: DraggingStyle | NotDraggingStyle | undefined) => {
    // lock x axis when dragging
    if (style?.transform) {
      return {
        ...style,
        // style.transform = transform(Xpx, Ypx) - splitting string to only get the X position
        // and lock the Y position when dragging
        transform: `${style.transform.split(',')[0]}, 0px)`,
      };
    }
    return style;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
    const MIDDLE_CLICK_BTN = 1;
    if (e.button === MIDDLE_CLICK_BTN) {
      dispatch(removeTab(index));
    }
  };

  useEffect(() => {
    if (active === index && !scrolledTo && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
      setScrolledTo(true);
    }
    setScrolledTo(false);
  }, [active, tabInView, index, scrolledTo]);

  return (
    <Draggable key={tabName} draggableId={tabName} index={index}>
      {(draggableProvided) => (
        <S.DraggableTabWrapper
          role="tab"
          active={index === active}
          onClick={() => dispatch(setActiveTab(index))}
          ref={(r) => {
            ref.current = r;
            draggableProvided.innerRef(r);
          }}
          {...draggableProvided.draggableProps}
          {...draggableProvided.dragHandleProps}
          style={getDraggableStyle(draggableProvided.draggableProps.style)}
          onMouseUp={handleMouseUp}
        >
          <S.TabNameWrapper>{tabName}</S.TabNameWrapper>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined style={{ fontSize: '12px', color: theme.text }} />}
            onClick={(e) => {
              e.stopPropagation(); // stop propagation for above tab onclick event
              dispatch(removeTab(index));
            }}
          />
        </S.DraggableTabWrapper>
      )}
    </Draggable>
  );
};

export default DraggableTab;
