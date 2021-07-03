import React from "react";
import { Typography } from "antd";
import { Skeleton } from "antd";

const ListView = ({ isLoading, degree }) => {
  const { Title } = Typography;

  return (
    <>
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          {degree["concentrations"].map((concentration) => (
            <div
              className="listPage"
              id={concentration["name"]}
              key={concentration["name"]}
            >
              <Title className="text">{concentration["name"]}</Title>
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default ListView;
