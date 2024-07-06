import React from 'react';
import PageContainer from 'styles/PageContainer';
import devsocLogo from 'assets/devsocLogo.svg';
import footerBlobSrc from 'assets/LandingPage/footerBlob.svg';
import { CURR_YEAR } from 'config/constants';
import S from './styles';

const Footer = () => {
  return (
    <div>
      <S.FooterBlob src={footerBlobSrc} />
      <S.FooterContentBody>
        <PageContainer>
          <S.FooterContentContainer>
            <S.FooterLogoWrapper>
              <S.DevSocLogo src={devsocLogo} alt="DevSoc Logo" />
              <b>© {CURR_YEAR} — UNSW Software Development Society</b>
            </S.FooterLogoWrapper>
            <S.FooterDisclaimer>
              <div>
                Software Development Society (DevSoc) is a student society comprised of interested
                developers, inventors and tech enthusiasts. We do not represent the School, Faculty,
                or University (UNSW).
              </div>
              <div>
                This website seeks to be a general guide for degree planning and course selection,
                but its information has not been officially endorsed and is subject to change or
                correction. This is not official advice, and you should confirm any statements are
                correct before relying on it. You should confirm with official resources endorsed by
                UNSW and any information found here may not necessarily represent those of the
                University, Faculty, School, or the Software Development Society.
              </div>
              <div>
                You are responsible for planning your degree and the Software Development Society
                has no responsibility on whether the information shown is accurate.
              </div>
              <div>Circles was made with love by students for students.</div>
            </S.FooterDisclaimer>
          </S.FooterContentContainer>
        </PageContainer>
      </S.FooterContentBody>
    </div>
  );
};

export default Footer;
