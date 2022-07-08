import React, { useState } from "react";
import { Button, Empty, Typography } from "antd";
import CourseListModal from "components/CourseListModal";
import CourseBadge from "../CourseBadge";
import S from "./styles";

const GridViewSubgroup = ({
  uoc,
  subgroupKey,
  subgroupEntries,
  hasLotsOfCourses,
}) => {
  const { Title } = Typography;

  const subgroup = subgroupEntries.map((course) => (
    <CourseBadge course={course} key={course.key} />
  ));

  const courseSection = () => {
    const [modalVisible, setModalVisible] = useState(false);
    if (hasLotsOfCourses && subgroupEntries.length > 0) {
      return (
        <S.CourseGroup>
          <Button
            className="viewSwitcher"
            type="primary"
            onClick={() => setModalVisible(true)}
          >
            View All Courses
          </Button>
          <CourseListModal
            title={subgroupKey}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            courses={subgroupEntries}
          />
        </S.CourseGroup>
      );
    }

    if (subgroupEntries.length > 0) {
      return subgroup;
    }

    return <Empty description="Nothing to see here! 👀" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  };

  return (
    <div key={subgroupKey}>
      <Title level={2}>{subgroupKey}</Title>
      <Title level={3}>{uoc} UOC worth of courses</Title>
      <S.CourseGroup>
        {courseSection()}
      </S.CourseGroup>
      <br />
    </div>
  );
};

export default GridViewSubgroup;
