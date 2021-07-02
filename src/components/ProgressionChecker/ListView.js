import React from "react";
import { Typography } from "antd";
import { Skeleton } from "antd";

const ListView = ({ loading, degree }) => {
  const { Title } = Typography;

  return (
    <>
      {loading ? (
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
