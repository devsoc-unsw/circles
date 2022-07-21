const defaultNode = {
  size: 70,
  style: {
    fill: "#9254de",
    stroke: "#9254de",
    cursor: "pointer",
  },
  labelCfg: {
    style: {
      fill: "#fff",
      fontFamily: "Arial",
      cursor: "pointer",
    },
  },
};

const unplannedNodeAdditionalStyle = (courseCode) => ({
  id: courseCode,
  label: courseCode,
  style: {
    fill: "#fff",
    stroke: "#9254de",
  },
  labelCfg: {
    style: {
      fill: "#9254de",
    },
  },
});

export default {
  defaultNode,
  unplannedNodeAdditionalStyle,
};
