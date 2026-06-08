import styled, { css, keyframes } from 'styled-components';
import { shake } from '../common/styles';

// Rotates out from behind the card's bottom-right corner (pivot = right bottom)
const personReveal = keyframes`
  0%   { transform: rotate(0deg);  opacity: 0; }
  5%   { transform: rotate(0deg);  opacity: 0; }
  20%  { transform: rotate(45deg); opacity: 1; }
  72%  { transform: rotate(45deg); opacity: 1; }
  85%  { transform: rotate(0deg);  opacity: 0; }
  100% { transform: rotate(0deg);  opacity: 0; }
`;

// Bubble: synced with personReveal (both appear at 20%, both retreat at 72–85%)
const bubblePop = keyframes`
  0%   { opacity: 0; transform: translateY(-50%) scale(0.85); }
  5%   { opacity: 0; transform: translateY(-50%) scale(0.85); }
  20%  { opacity: 1; transform: translateY(-50%) scale(1);    }
  72%  { opacity: 1; transform: translateY(-50%) scale(1);    }
  85%  { opacity: 0; transform: translateY(-50%) scale(0.85); }
  100% { opacity: 0; transform: translateY(-50%) scale(0.85); }
`;

type CourseWrapperProps = {
  $isSmall: boolean;
  $summerEnabled: boolean;
  $warningsDisabled: boolean;
  $isWarning: boolean;
  $dragDisabled: boolean;
};

const CourseWrapper = styled.li<CourseWrapperProps>`
  position: relative;
  user-select: none;
  font-size: 0.8rem;
  cursor: grab;
  padding: 0.9em;
  padding-right: 1.1em;
  padding-left: 1.1em;
  border-radius: ${({ $isSmall }) => ($isSmall ? '0.2em' : '1em')};
  max-width: 20em;
  min-width: 12em;
  margin-top: 1em;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.7em;
  line-height: 1.5715;
  background-color: ${({ theme }) => theme.draggableCourse.backgroundColor};

  ${({ $isSmall }) =>
    $isSmall &&
    css`
      border-radius: 1.25em;
      padding: 0.8em;
      width: 10em;
    `}

  ${({ $summerEnabled, $isSmall }) =>
    $summerEnabled &&
    $isSmall &&
    css`
      width: 8em;
    `}

  ${({ $warningsDisabled }) =>
    $warningsDisabled &&
    css`
      background-color: #fff3e0;
    `}

  ${({ $isWarning }) =>
    $isWarning &&
    css`
      background-color: ${({ theme }) => theme.draggableCourse.warningBackgroundColor};
    `}

  ${({ $dragDisabled }) =>
    $dragDisabled &&
    css`
      background-color: ${({ theme }) => theme.draggableCourse.dragDisabledBackgroundColor};

      &:hover {
        animation: ${shake} 0.25s;
        transform: none;
        cursor: not-allowed;
      }
    `}
`;

const CourseLabel = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  padding: 0px;
  margin: 0px;
`;

const MultiCourseBadgeWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;

// Behind the card (z-index: -1); pivot at card's bottom-right corner
const GroupworkPersonWrapper = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  transform-origin: right bottom;
  animation: ${personReveal} 2s ease-in-out forwards;
`;

// Icon: just sizing and colour; no extra animation
const GroupworkIcon = styled.span`
  display: block;
  font-size: 2.2em;
  line-height: 1;
  color: #555;
`;

// Bubble: absolutely positioned at card's right edge, vertically centered
const SpeechBubble = styled.div`
  position: absolute;
  left: calc(100% + 2em);
  top: 50%;
  pointer-events: none;
  z-index: 100;
  background: ${({ theme }) => theme.draggableCourse.backgroundColor};
  border: 1.5px solid rgba(0, 0, 0, 0.32);
  border-radius: 10px;
  padding: 5px 10px;
  font-size: 0.78em;
  font-weight: 500;
  white-space: nowrap;
  color: ${({ theme }) => theme.text};
  animation: ${bubblePop} 2s ease-in-out forwards;

  /* Border-coloured pointer triangle */
  &::before {
    content: '';
    position: absolute;
    left: -9px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 7px 9px 7px 0;
    border-color: transparent rgba(0, 0, 0, 0.32) transparent transparent;
  }

  /* Fill triangle that closes the gap against the bubble body */
  &::after {
    content: '';
    position: absolute;
    left: -5px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6px 7px 6px 0;
    border-color: transparent ${({ theme }) => theme.draggableCourse.backgroundColor} transparent
      transparent;
  }
`;

export default {
  CourseWrapper,
  CourseLabel,
  MultiCourseBadgeWrapper,
  GroupworkPersonWrapper,
  GroupworkIcon,
  SpeechBubble
};
