import React from 'react';
import circlesLogo from './circlesLogo.svg';
import CSESocLogo from './CSESocLogo.png';
import S from './Footer/styles';

const Footer = () => {
  return (
    <div>
      <div className="left">
        <b>circles</b>
        <img src={CSESocLogo} alt="CSESoc Logo" />
        <img src={circlesLogo} alt="Circles Logo" />
        <p>
          CSESoc is the constituent student society of UNSW’s School of Computer Science and
          Engineering. We do not represent the School, Faculty, or University. This website seeks to
          be a general guide, but its information has not been officially endorsed and is subject to
          change or correction. This is not official advice, and you should confirm any statements
          are correct before relying on it. Any opinions expressed are those of the authors, and may
          not necessarily represent those of the University, Faculty, School, or Society. You are
          responsible for any content provided and should only post content which you are
          comfortable with sharing. We reserve the right to remove content from the website if it is
          deemed to be abusive, offensive or otherwise inappropriate. UNSW policies apply and if a
          breach is detected, further action may be taken with the University.
        </p>
        <p>© 2022 — CSESoc UNSW</p>
      </div>
      <div className="right">
        <b>Leave Feedback</b>
        <p>Any comments, suggestions or feedback for improvement? We want to hear it all! </p>
        <div className="info">
          <input className="landing-page-input" placeholder="Name" />
          <input placeholder="Email address" />
        </div>
        <S.styledInput placeholder="Comment" />
        <p>Checkout our github repo!</p>
      </div>
    </div>
  );
};

export default Footer;
