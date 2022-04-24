import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import "./courseTabs.less";
import { Draggable } from "react-beautiful-dnd";
import { CloseOutlined } from "@ant-design/icons";
import courseTabActions from "../../../actions/courseTabActions";
import useIntersectionObserver from "../../../hooks/useIntersectionObserver";

const CourseTab = ({ tab, index }) => {
  const [scrolledTo, setScrolledTo] = useState(false);
  const dispatch = useDispatch();
  const ref = useRef(null);
  const tabInView = useIntersectionObserver(ref);
  const { active } = useSelector((state) => state.tabs);

  const getDraggableStyle = (style) => {
    // lock x axis when dragging
    if (style.transform) {
      return {
        ...style,
        transform: `${style.transform.split(",").shift()}, 0px)`,
      };
    }
    return style;
  };

  const handleMouseDown = (e) => {
    const MIDDLE_CLICK_BTN = 1;
    if (e.button === MIDDLE_CLICK_BTN) {
      dispatch(courseTabActions("REMOVE_TAB", index));
    }
  };

  useEffect(() => {
    if (active === index && !scrolledTo) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      setScrolledTo(true);
    }
    setScrolledTo(false);
  }, [active, tabInView, index, scrolledTo]);

  return (
    <Draggable key={tab} draggableId={tab} index={index}>
      {(draggableProvided, _) => (
        <div
          role="tab"
          className={index === active ? "cs-tab active" : "cs-tab"}
          onClick={() => dispatch(courseTabActions("SET_ACTIVE_TAB", index))}
          ref={(r) => {
            ref.current = r;
            draggableProvided.innerRef(r);
          }}
          {...draggableProvided.draggableProps}
          {...draggableProvided.dragHandleProps}
          style={getDraggableStyle(draggableProvided.draggableProps.style)}
          onMouseDown={handleMouseDown}
        >
          <span className="cs-tab-name">{tab}</span>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined style={{ fontSize: "12px" }} />}
            onClick={(e) => {
              e.stopPropagation(); // stop propagation for above tab onclick event
              dispatch(courseTabActions("REMOVE_TAB", index));
            }}
          />
        </div>
      )}
    </Draggable>
  );
};

export default CourseTab;
