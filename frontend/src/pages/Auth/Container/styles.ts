import styled from 'styled-components';

const LoginContainer = styled.div`
  width: 100%;
  height: 100vh;
  padding: 4rem 10rem;
  background-color: #f8f8f9;
`;

const Wrapper = styled.div`
  display: flex;
`;

const Left = styled.div`
  flex: 0.9;
  width: 100%;
  height: 100%;
  background-color: #9453e6;
  padding: 30px;
  border-radius: 15px 0px 0px 15px;
`;

const SplashArt = styled.img`
  width: 100%;
  height: 100%;
`;

const Right = styled.div`
  flex: 1;
  width: 100%;
  background-color: #fff;
  border-radius: 0px 15px 15px 0px;
`;

const Login = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  left: 15%;
  position: relative;

  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #9453e6;
  }

  p {
    font-weight: 500;
    color: #323e4d;
  }

  button {
    background: linear-gradient(90deg, #b47cfb 32.03%, #8d48f6 87.53%, #8037f4 106.41%);
    border: none;
    width: 50%;
    height: 70px;
    color: #fff;
    font-weight: 700;
    font-size: 20px;
  }
`;

const Back = styled.img`
  position: absolute;
  top: 10%;
  left: -10%;
  width: 10%;
`;

export default {
  Left,
  LoginContainer,
  SplashArt,
  Wrapper,
  Login,
  Right,
  Back
};
