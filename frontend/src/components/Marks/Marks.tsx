import React from 'react';
import { Typography } from 'antd';
import { Mark } from 'types/planner';

type Prop = {
  mark: Mark
};

const Marks = ({ mark }: Prop) => {
  const { Text } = Typography;
  return (
    <div>
      <Text strong className="text">Mark: </Text>
      <Text className="text">
        {/* Marks can be strings (i.e. HD, CR) or a number (i.e. 90, 85). Mark can be 0. */}
        {(mark === undefined) ? 'N/A' : mark}
      </Text>
    </div>
  );
};

export default Marks;
