import styled, { DefaultTheme } from 'styled-components';

// Colours come from the theme (light and dark), tuned for WCAG contrast.
const icon = ({ theme }: { theme: DefaultTheme }) => theme.popular.icon;
const text = ({ theme }: { theme: DefaultTheme }) => theme.popular.text;

// `1em` keeps the flame the same size as whatever text it sits beside, so it
// scales with both the sidebar menu rows and the badge label.
const Flame = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 1em;
  line-height: 1;
  color: ${icon};

  &:focus-visible {
    outline: 2px solid ${icon};
    outline-offset: 2px;
    border-radius: 2px;
  }
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
  background-color: ${({ theme }) => theme.popular.background};
  color: ${text};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  vertical-align: middle;

  &:focus-visible {
    outline: 2px solid ${text};
    outline-offset: 2px;
  }
`;

export default {
  Flame,
  Badge
};
