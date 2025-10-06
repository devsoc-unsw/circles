import styled, { css } from 'styled-components';
import { GridItem } from './common/styles';

const ContainerWrapper = styled.div`
  height: calc(100vh - var(--navbar-height) - var(--option-header-height));
  padding-top: var(--tp-main-container-padding);
  overflow: auto;
`;

const PlannerContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: var(--tp-planner-container-margin);

  @media (max-width: 800px) {
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    margin: 0.5rem;
    height: calc(
      100vh - var(--navbar-height) - var(--option-header-height) - var(--tp-main-container-padding)
    );
  }
`;

const PlannerGridWrapper = styled.div<{ $summerEnabled?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $summerEnabled }) =>
    $summerEnabled ? '7em 1fr 1fr 1fr 1fr 1fr' : '7em 1fr 1fr 1fr 1fr'};
  align-items: center;

  @media (max-width: 800px) {
    display: flex;
    flex-direction: column;
    grid-template-columns: repeat(2, 1fr);
  }
`;

const YearGridBox = styled(GridItem)`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 800px) {
    margin-bottom: 0.5rem;
  }
`;

const YearText = styled.div<{ $currYear: boolean }>`
  ${({ $currYear }) =>
    $currYear &&
    css`
      color: #9254de;
      font-weight: bold;
    `}
`;

const YearWrapper = styled.div`
  ${YearText} {
    display: block;
  }

  .year-tooltip {
    display: none;
  }

  &:hover {
    cursor: pointer;

    ${YearText} {
      display: none;
    }

    .year-tooltip {
      display: block;
    }
  }
`;

export default {
  ContainerWrapper,
  PlannerContainer,
  PlannerGridWrapper,
  YearGridBox,
  YearText,
  YearWrapper
};
