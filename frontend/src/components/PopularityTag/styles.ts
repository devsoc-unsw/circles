import styled from 'styled-components';

const ACCENT = '#fa8c16';

// `1em` keeps the flame the same size as whatever text it sits beside, so it
// scales with both the sidebar menu rows and the badge label.
const Flame = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 1em;
  line-height: 1;
  color: ${ACCENT};
`;

// Pill used in the course description, where there is room for a label. Its
// font size is fixed rather than inherited so it stays badge-sized next to the
// much larger course heading.
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background-color: rgba(250, 140, 22, 0.12);
  color: ${ACCENT};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  vertical-align: middle;
`;

export default {
  Flame,
  Badge
};
