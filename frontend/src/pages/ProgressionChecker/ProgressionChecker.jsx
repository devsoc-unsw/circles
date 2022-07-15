import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  BorderlessTableOutlined,
  EyeFilled,
  EyeInvisibleOutlined,
  // TableOutlined,
} from "@ant-design/icons";
import { Button, Divider, notification } from "antd";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import Dashboard from "./Dashboard";
import GridView from "./GridView/GridView";
import S from "./styles";
import TableView from "./TableView";

const ProgressionCheckerCourses = ({ structure, isLoading }) => {
  const views = {
    GRID: "grid",
    CONCISE: "grid-concise",
    TABLE: "table",
  };
  const defaultView = views.CONCISE;
  const [view, setView] = useState(defaultView);

  return (
    <div>
      {(view === views.GRID || view === views.CONCISE) ? (
        <>
          <S.ViewSwitcherWrapper>
            <Button
              type="primary"
              icon={view === views.GRID ? <EyeInvisibleOutlined /> : <EyeFilled />}
              onClick={() => setView(view === views.GRID ? views.CONCISE : views.GRID)}
            >
              {view === views.GRID ? "Display Concise Mode" : "Display Full Mode"}
            </Button>
            {/* TODO: Disable TableView for now */}
            {/* <Button
              type="primary"
              icon={<TableOutlined />}
              onClick={() => setView(views.TABLE)}
            >
              Display Table View
            </Button> */}
          </S.ViewSwitcherWrapper>
          <GridView isLoading={isLoading} structure={structure} concise={view === views.CONCISE} />
        </>
      ) : (
        <>
          <S.ViewSwitcherWrapper>
            <Button
              type="primary"
              icon={<BorderlessTableOutlined />}
              onClick={() => setView(defaultView)}
            >
              Display Grid View
            </Button>
          </S.ViewSwitcherWrapper>
          <TableView isLoading={isLoading} structure={structure} />
        </>
      )}
    </div>
  );
};

const ProgressionChecker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [structure, setStructure] = useState({});
  const [uoc, setUoc] = useState(null);

  const {
    programCode, specs,
  } = useSelector((state) => state.degree);
  const planner = useSelector((state) => state.planner);

  useEffect(() => {
    // get structure of degree
    const fetchStructure = async () => {
      try {
        const res = await axios.get(`/programs/getStructure/${programCode}/${specs.join("+")}`);
        setStructure(res.data.structure);
        setUoc(res.data.uoc);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
      setIsLoading(false);
    };
    if (programCode && specs.length > 0) fetchStructure();
  }, [programCode, specs]);

  useEffect(() => {
    notification.info({
      message: "Disclaimer",
      description: "This progression check is intended to outline the courses required by your degree and may not be 100% accurate. Please refer to UNSW's official progression check and handbook for further accuracy.",
      placement: "bottomRight",
      duration: 20,
    });
  }, []);

  const storeUOC = {};

  // Example groups: Major, Minor, General, Rules
  Object.keys(structure).forEach((group) => {
    storeUOC[group] = {
      total: 0,
      curr: 0,
    };

    // Example subgroup: Core Courses, Computing Electives
    Object.keys(structure[group]).forEach((subgroup) => {
      // Do not include if field is not an object i.e. 'name' field
      if (typeof structure[group][subgroup] === "string") return;

      storeUOC[group].total += structure[group][subgroup].UOC;
      const subgroupStructure = structure[group][subgroup];

      const isRule = subgroupStructure.type && subgroupStructure.type.includes("rule");

      if (subgroupStructure.courses && !isRule) {
        // only consider disciplinary component courses
        Object.keys(subgroupStructure.courses).forEach((courseCode) => {
          if (planner.courses[courseCode]) {
            storeUOC[group].curr += planner.courses[courseCode].UOC;
          }
        });
      }
    });
  });

  return (
    <PageTemplate>
      <S.Wrapper>
        <Dashboard storeUOC={storeUOC} isLoading={isLoading} structure={structure} uoc={uoc} />
        <Divider id="divider" />
        <ProgressionCheckerCourses structure={structure} isLoading={isLoading} />
      </S.Wrapper>
    </PageTemplate>
  );
};

export default ProgressionChecker;
