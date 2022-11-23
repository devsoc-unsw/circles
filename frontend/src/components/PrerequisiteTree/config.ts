import type { LayoutConfig } from '@antv/g6';
import TREE_CONSTANTS from './constants';

const graphLayout: LayoutConfig = {
  type: 'mindmap',
  direction: 'H',
  getVGap: () => 0,
  getHGap: () => 100,
  getSide: (node: { data: { rootRelationship: string } }) =>
    node.data.rootRelationship === TREE_CONSTANTS.PREREQ ? 'left' : 'right'
};

const defaultNode = {
  type: 'rect',
  style: {
    radius: 5,
    fill: '#9254de',
    stroke: '#9254de',
    cursor: 'pointer'
  },
  labelCfg: {
    style: {
      fill: '#fff',
      fontFamily: 'Arial',
      fontSize: 14,
      fontWeight: 'bold',
      cursor: 'pointer'
    }
  }
};

const prereqNodeAdditionalStyle = (courseName: string) => ({
  id: courseName,
  label: courseName,
  style: {
    fill: '#de545b',
    stroke: '#de545b'
  },
  labelCfg: {
    style: {
      fill: '#5e2427',
      fontWeight: 'normal'
    }
  },
  rootRelationship: TREE_CONSTANTS.PREREQ
});

const unlocksNodeAdditionalStyle = (courseName: string) => ({
  id: courseName,
  label: courseName,
  style: {
    fill: '#a0de54',
    stroke: '#a0de54'
  },
  labelCfg: {
    style: {
      fill: '#445e24',
      fontWeight: 'normal'
    }
  },
  rootRelationship: TREE_CONSTANTS.UNLOCKS
});

const unrecognisedNodeAdditionalStyle = (courseName: string) => ({
  id: courseName,
  label: courseName,
  rootRelationship: undefined
});

const defaultEdge = {
  type: 'cubic-horizontal', // polyline could be used but pivots are unreliable with lots of courses
  color: '#A6A6A6',
  size: 1,
  labelCfg: {
    refX: 25,
    position: 'start',
    autoRotate: true,
    style: {
      fill: '#595959',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontSize: 14,
      background: {
        fill: '#ffffff',
        padding: [2, 2, 2, 2],
        radius: 5
      }
    }
  }
};

const prereqEdgeAdditionalStyle = (id: string) => ({
  id,
  label: 'is a prereq for'
});

const unlocksEdgeAdditionalStyle = (id: string) => ({
  id,
  label: 'unlocks'
});

const defaultEdgeAdditionalStyle = (id: string) => ({
  id
});

export default {
  graphLayout,
  defaultNode,
  prereqNodeAdditionalStyle,
  unlocksNodeAdditionalStyle,
  unrecognisedNodeAdditionalStyle,
  defaultEdge,
  prereqEdgeAdditionalStyle,
  unlocksEdgeAdditionalStyle,
  defaultEdgeAdditionalStyle
};
