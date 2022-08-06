import styled from 'styled-components';

const SkeletonWrapper = styled.div`
  display: flex;
  gap: 5vw;
  overflow: hidden;
`;

const SkeletonDescription = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 50vw;
  overflow: hidden;
  gap: 20px;
`;

const SkeletonAttributes = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 20vw;
  gap: 20px;
`;

export default { SkeletonWrapper, SkeletonDescription, SkeletonAttributes };
