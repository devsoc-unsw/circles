import React from "react";
import {
  Typography, Button, Space, Skeleton,
} from "antd";

const ListView = ({ isLoading }) => {
  const { Title } = Typography;

  const commcorecompleted = ["COMM 1100: Business Decision Making",
    "COMM 1110: Evidence-Based Problem Solving",
    "COMM 1140: Financial Management",
    "COMM 1190: Data, Insights and Decisions"];
  const commcoreplanned = ["COMM 1170: Organisational Resources",
    "COMM 1180: Value Creation"];
  const commcoreunplanned = ["COMM 1120: Collaboration and Innovation in Business",
    "COMM 1150: Global Business Environments"];
  const commmajorcompleted = ["FINS 1612: Capital Markets and Institutions"];
  const commmajorplanned = ["FINS 3645: Financial Market Data Design and Analysis",
    "FINS 3646: Toolkit for Finance",
    "FINS 3647: Bitcoin and Decentralised Finance"];
  const commmajorunplanned = ["FINS 3648: Banking, Finance and Technology"];
  const commmajorchoice = ["FINS 2613: Intermediate Business Finance",
    "FINS 2624: Portfolio Management",
    "FINS 3623: Venture Capital",
    "FINS 3630: Bank Financial Management"];
  const commmajorelective = ["ACCT 3563: Issues in Financial Reporting and Analysis",
    "FINS 2622: Asia-Pacific Capital Markets",
    "FINS 2624: Portfolio Management",
    "FINS 2643: Wealth Management",
    "FINS 3623: Venture Capital",
    "FINS 3625: Applied Corporate Finance",
    "FINS 3630: Bank Financial Management",
    "FINS 3631: Risk and Insurance",
    "FINS 3633: Real Estate Finance"];

  const compcorecompleted = ["COMP 1511: Programming Fundamentals",
    "COMP 1521: Computer Systems Fundamentals"];
  const compcoreplanned = ["COMP 1531: Software Engineering Fundamentals",
    "COMP 2511: Object-Oriented Design & Programming",
    "COMP 2521: Data Structures and Algoritms",
    "COMP 3121: Algorithms and Programming Techniques",
    "COMP 3161: Concepts of Programming Languages"];
  const compcoreunplanned = ["COMP 3900: Computer Science Project",
    "COMP 4920: Professional Issues and Ethics in Information Technology",
    "MATH 1081: Discrete Mathematics"];

  const compmajorelective = ["COMP 3131: Progamming Languages and Compilers",
    "COMP 3141: Software System Design and Implementation",
    "COMP 3151: Foundations of Concurrency",
    "COMP 6771: Advanced C++ Programming"];

  return (
    <>
      {isLoading ? (
        <Skeleton />
      ) : (
        <div
          className="listPage"
        >
          <Title className="text">Commerce (Financial Technology)</Title>
          <Title className="text" level={3}>Core Courses</Title>
          <Space size={[20, 20]} wrap>
            {commcorecompleted.map((commcorecompleted, index) => (
              <Button className="checkerButton" type="primary" key={index}>{commcorecompleted}</Button>
            ))}
            {commcoreplanned.map((commcoreplanned, index) => (
              <Button className="checkerButton" type="primary" ghost key={index}>{commcoreplanned}</Button>
            ))}
            {commcoreunplanned.map((commcoreunplanned, index) => (
              <Button className="checkerButton" type="default" ghost key={index}>{commcoreunplanned}</Button>
            ))}
          </Space>
          <div className="space" />
          <Title className="text" level={3}>Discipline Core Courses</Title>
          <Title className="text" level={5}>42 UOC of the following courses</Title>
          <Space size={[20, 20]} wrap>
            {commmajorcompleted.map((commmajorcompleted, index) => (
              <Button className="checkerButton" type="primary" key={index}>{commmajorcompleted}</Button>
            ))}
            {commmajorplanned.map((commmajorplanned, index) => (
              <Button className="checkerButton" type="primary" ghost key={index}>{commmajorplanned}</Button>
            ))}
            {commmajorunplanned.map((commmajorunplanned, index) => (
              <Button className="checkerButton" type="default" ghost key={index}>{commmajorunplanned}</Button>
            ))}
          </Space>
          <div className="space2" />
          <Title className="text" level={5}>One of the following</Title>
          <Space size={[20, 20]} wrap>
            {commmajorchoice.map((commmajorchoice, index) => (
              <Button className="checkerButton" type="default" ghost key={index}>{commmajorchoice}</Button>
            ))}
          </Space>
          <div className="space" />
          <Title className="text" level={3}>Discipline Electives</Title>
          <Title className="text" level={5}>At least 6 UOC of the following courses</Title>
          <Space size={[20, 20]} wrap>
            {commmajorelective.map((commmajorelective, index) => (
              <Button className="checkerButton" type="default" ghost key={index}>{commmajorelective}</Button>
            ))}
          </Space>

          <div className="space" /><div className="space" /><div className="space" />
          <Title className="text">Computer Science (Programming Languages)</Title>
          <Title className="text" level={3}>Core Courses</Title>
          <Title className="text" level={5}>72 UOC of the following courses</Title>
          <Space size={[20, 20]} wrap>
            {compcorecompleted.map((compcorecompleted, index) => (
              <Button className="checkerButton" type="primary" key={index}>{compcorecompleted}</Button>
            ))}
            {compcoreplanned.map((compcoreplanned, index) => (
              <Button className="checkerButton" type="primary" ghost key={index}>{compcoreplanned}</Button>
            ))}
            {compcoreunplanned.map((compcoreunplanned, index) => (
              <Button className="checkerButton" type="default" ghost key={index}>{compcoreunplanned}</Button>
            ))}
          </Space>
          <div className="space2" />
          <Title className="text" level={5}>One of the following</Title>
          <Space size={[20, 20]} wrap>
            <Button className="checkerButton" type="dashed" ghost>MATH 1131: Mathematics 1A</Button>
            <Button className="checkerButton" type="primary">MATH 1141: Higher Mathematics 1A</Button>
          </Space>
          <div className="space2" />
          <Title className="text" level={5}>One of the following</Title>
          <Space size={[20, 20]} wrap>
            <Button className="checkerButton" type="primary" ghost>MATH 1231: Mathematics 1B</Button>
            <Button className="checkerButton" type="dashed" ghost>MATH 1241: Higher Mathematics 1B</Button>
          </Space>

          <div className="space" />
          <Title className="text" level={3}>Discipline Core Courses</Title>
          <Title className="text" level={5}>hmmm... confused ;-;</Title>

          <div className="space" />
          <Title className="text" level={3}>Discipline Electives</Title>
          <Title className="text" level={5}>At least 18 UOC of the following courses</Title>
          <Space size={[20, 20]} wrap>
            {compmajorelective.map((compmajorelective, index) => (
              <Button className="checkerButton" type="default" ghost key={index}>{compmajorelective}</Button>
            ))}
          </Space>
          <div className="space" /><div className="space" /><div className="space" />
        </div>
      )}
    </>
  );
};

export default ListView;
