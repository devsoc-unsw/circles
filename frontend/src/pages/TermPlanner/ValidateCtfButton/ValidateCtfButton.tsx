/* eslint-disable */
import React from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import prepareCoursesForValidationPayload from 'utils/prepareCoursesForValidationPayload';
import { RootState } from 'config/store';
import CS from '../common/styles';
import S from './styles';
import { Typography } from 'antd';
import styled from 'styled-components';

type CtfResult = {
  valid: boolean;
  failed: number;
  passed: Array<string>;
  message: string;
  flags: Array<string>;
};

const { Text, Title } = Typography;

const TextBlock = styled(Text)`
  display: block;
  padding: 1em;
  color: ${({ theme }) => theme.graph.tabTextColor};
`;

const loadingResult: CtfResult = {
  valid: false,
  failed: 0,
  passed: [],
  message: 'Loading...',
  flags: [],
};

const ModalTitle = styled(Title)`
  margin: 0 !important;
  color: ${({ theme }) => theme.text} !important;
`;


const ValidateCtfButton = () => {
  const planner = useSelector((state: RootState) => state.planner);
  const degree = useSelector((state: RootState) => state.degree);
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState(loadingResult);

  const validateCtf = async () => {
    // TODO: Call this async and disaplay output
    setOpen(true);
    const res = await axios.post<CtfResult>(
      '/ctf/validateCtf/',
      prepareCoursesForValidationPayload(planner, degree, false)
    );
    setResult(res.data);
    console.log(res.data);
  };

  return (
    <>
      <CS.Button onClick={validateCtf}>Validate CTF</CS.Button>
      <S.Modal
        title="Validate CTF"
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        width="60%"
      >
        <ModalTitle level={4}>Passed Challenges</ModalTitle>
        <TextBlock>
          {
            <ol>
              {result.passed.map((challenge, index) => (
                <>
                  <li>
                    <TextBlock key={index}>{challenge}</TextBlock>
                  </li>
                </>
              ))}
            </ol>
          }
        </TextBlock>
        <ModalTitle level={4}>Unlocked Flags</ModalTitle>
        <TextBlock>
          <ol>
            {(result.flags.length > 0) && result.flags.map((flag, index) => (
              <>
                <li>
                  <TextBlock key={index}>{flag}</TextBlock>
                </li>
              </>
            ))}
          </ol>
        </TextBlock>
        <ModalTitle level={4}>
          {
            result.valid ? (
              <Text type="success">{result.message}</Text>
            ) : (
              <Text type="warning">Next: {result.message}</Text>
            )
          }
        </ModalTitle>
      </S.Modal>
    </>
  );
};

export default ValidateCtfButton;
