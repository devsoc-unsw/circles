import { animated } from "@react-spring/web";
import styled from "styled-components";

const Wrapper = styled.div`
  min-height: calc(100vh - var(--navbar-height));
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentWrapper = styled(animated.div)`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const CardsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
`;

export default { Wrapper, CardsWrapper, ContentWrapper };
