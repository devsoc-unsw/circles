import styled, { css } from 'styled-components';

export const Title = styled.h1`
  font-size: clamp(1.8rem, 2.5vw, 8rem);
  font-weight: bold;
`;

const LoginContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.loginSplash?.backgroundColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.div`
  display: flex;
  height: 80vh;
  width: 80vw;

  @media (max-width: 1440px) {
    width: 95vw;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: auto;
    width: 80%;
    margin-top: 2rem;
  }
`;

const Left = styled.div`
  flex: 0.9;
  width: 100%;
  height: 100%;
  ${({ theme }) =>
    theme.loginSplash &&
    css`
      background-color: ${theme.loginSplash.svgColor};
    `}
  padding: 50px;
  border-radius: 15px 0px 0px 15px;

  @media (max-width: 768px) {
    height: auto;
    padding: 30px;
    border-radius: 10px 10px 0 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const SplashArt = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;

  @media (max-width: 768px) {
    height: 75%;
    max-height: 400px;
  }
`;

const Right = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  background-color: ${({ theme }) => theme.body};
  border-radius: 0px 15px 15px 0px;

  @media (max-width: 768px) {
    flex: none;
    border-radius: 0 0 15px 15px;
    padding: 20px;
  }
`;

const Login = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5rem;

  h2 {
    align-self: flex-start;
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text};
  }
  p {
    align-self: flex-start;
    font-weight: 500;
    color: ${({ theme }) => theme.text};
  }

  @media (max-width: 768px) {
    position: relative;
    padding: 2rem 1rem;
    align-items: stretch;
    height: auto;

    h2,
    p {
      text-align: center;
      align-self: center;
    }
    h2 {
      font-size: 1.5rem;
    }
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(90deg, #b47cfb 32.03%, #8d48f6 87.53%, #8037f4 106.41%);
  border: none;
  width: 70%;
  height: 70px;
  color: #fff;
  font-weight: 700;
  font-size: 1.25rem;
  margin: calc(0.5rem + 1vw);
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    ${({ theme }) =>
      theme.loginSplash &&
      css`
        background: linear-gradient(270deg, #b47cfb 32.03%, #8d48f6 87.53%, #8037f4 106.41%);
      `}
  }
  &:active {
    ${({ theme }) =>
      theme.loginSplash &&
      css`
        transform: translateY(5%);
      `}
  }
  @media (max-width: 1200px) {
    width: 90%;
    border-radius: 10px;
  }
`;

const GuestButton = styled.button`
  background: transparent;
  border: linear-gradient(90deg, #b47cfb 32.03%, #8d48f6 87.53%, #8037f4 106.41%);
  width: 70%;
  height: 70px;
  color: ${({ theme }) => theme.text};
  font-weight: 700;
  font-size: 1.25rem;
  margin: calc(0.5rem + 1vw);
  cursor: pointer;
  transition: all 0.3s;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &:hover {
    ${({ theme }) =>
      theme.loginSplash &&
      css`
        background-color: #191b1b;
      `}
    color: #fff;
  }
  &:active {
    ${({ theme }) =>
      theme.loginSplash &&
      css`
        transform: translateY(5%);
      `}
  }
  @media (max-width: 1200px) {
    width: 90%;
    border-radius: 10px;
  }
`;

const Back = styled.img`
  position: absolute;
  top: 10%;
  left: 10%;
  width: 10%;

  @media (max-width: 1600px) {
    width: 12%;
  }
  @media (max-width: 768px) {
    position: relative;
    top: auto;
    left: auto;
    width: 25%;
    margin: 20px auto 20px auto;
    display: block;
  }
`;

export default {
  Left,
  LoginContainer,
  LoginButton,
  GuestButton,
  SplashArt,
  Wrapper,
  Login,
  Right,
  Back,
  Title
};
