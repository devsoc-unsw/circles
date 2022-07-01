import React, { useState } from "react";
import { Button } from "antd";
import CourseBadge from "../CourseBadge";
import S from "./styles";

const GridModal = ({ title, courses }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <div className="courseGroup">
      <Button
        className="viewSwitcher"
        type="primary"
        onClick={() => setModalVisible(true)}
      >
        View All Courses
      </Button>
      <S.CourseModal
        title={(
          <S.ModalHeader>
            <S.ModalTitle level={2}>Course List</S.ModalTitle>
            <S.ModalTitle level={3}>{title}</S.ModalTitle>
            <S.Instruction>Select your courses:</S.Instruction>
          </S.ModalHeader>
        )}
        width="625px"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <div className="content courseGroup">
          {courses.map((course) => (<CourseBadge course={course} key={course.key} />))}
        </div>
      </S.CourseModal>
    </div>
  );
};

export default GridModal;
