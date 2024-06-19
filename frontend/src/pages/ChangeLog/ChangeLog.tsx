import React from 'react';
import Collapsible from 'components/Collapsible';
import PageTemplate from 'components/PageTemplate';
import S from './styles';

const ChangeLog = () => (
  <PageTemplate>
    <S.ContainerWrapper>
      <h1>Change Log</h1>
      <p>These are all the versions we have released.</p>
      <br />
      {/* Latest Version */}
      <Collapsible title="Version 3.0 (Latest)">
        <S.TextBlock>
          <p>May 1st 2023</p>
          <p>blah blah and blah blah</p>
        </S.TextBlock>
      </Collapsible>

      <Collapsible title="Version 2.8">
        <S.TextBlock>Crazy Blahs</S.TextBlock>
      </Collapsible>

      {/* ASK: when one collapsible is open, close all the others..? but this requires creating new component OR implementing this for ALL incl CS tab details */}
    </S.ContainerWrapper>
  </PageTemplate>
);

export default ChangeLog;
