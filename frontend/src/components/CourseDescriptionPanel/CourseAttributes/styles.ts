import styled from 'styled-components';

const AttributeWrapper = styled.div`
  border-bottom: #d9d9d9 solid 1px; // grey-5
  padding: 10px 0;
`;

const AttributeText = styled.div`
  font-size: 0.9rem;
`;

const TermWrapper = styled.div`
  margin-top: 20px;
`;

const AttributesWrapperConcise = styled.div`
  display: flex;
  justify-content: space-evenly;
`;

const AttributeConcise = styled.div`
  padding: 16px 4px;
  flex: 1 1 0;
  text-align: center;

  &:nth-child(2) {
    border-left: #d9d9d9c0 solid 1px;
    border-right: #d9d9d9c0 solid 1px;
  }
`;

export default {
  AttributeWrapper,
  AttributeText,
  TermWrapper,
  AttributesWrapperConcise,
  AttributeConcise
};
