import React, { useState } from 'react';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import PageTemplate from 'components/PageTemplate';
import SnakeGame from 'components/SnakeGame/SnakeGame';
import changelogDataRaw from './changeLogData.json';
import S from './styles';

const changelogData: VersionData[] = changelogDataRaw as VersionData[];

type ChangeLogItem = {
  main: string;
  details?: string[];
};

type SectionProps = {
  title: string;
  items?: ChangeLogItem[];
};

const Section: React.FC<SectionProps> = ({ title, items }) => {
  if (!items?.length) return null;
  return (
    <div>
      <S.SectionTitle>{title}:</S.SectionTitle>
      <S.List>
        {items.map((item) => (
          <li key={item.main}>
            {item.main}
            {item.details && (
              <S.SubList>
                {item.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </S.SubList>
            )}
          </li>
        ))}
      </S.List>
    </div>
  );
};

type VersionData = {
  date: string;
  flair?: string;
  major?: ChangeLogItem[];
  minor?: ChangeLogItem[];
  fixes?: ChangeLogItem[];
};

type VersionSectionProps = {
  versionData: VersionData;
  isOpenDefault: boolean;
};

const VersionSection: React.FC<VersionSectionProps> = ({ versionData, isOpenDefault }) => {
  const [open, setOpen] = useState(isOpenDefault);
  return (
    <S.VersionCard>
      <S.Header onClick={() => setOpen(!open)}>
        {open ? (
          <DownOutlined style={{ marginRight: 8 }} />
        ) : (
          <RightOutlined style={{ marginRight: 8 }} />
        )}
        {versionData.date}
        {versionData.flair && <S.Flair>- {versionData.flair}</S.Flair>}
      </S.Header>
      {open && (
        <>
          <Section title="Major Changes" items={versionData.major} />
          <Section title="Minor Changes" items={versionData.minor} />
          <Section title="Bug Fixes" items={versionData.fixes} />
        </>
      )}
    </S.VersionCard>
  );
};

const ChangeLog = () => {
  const [snakeGameOpen, setSnakeGameOpen] = useState(false);

  return (
    <PageTemplate>
      <S.Wrapper>
        <S.Title>Changelog</S.Title>
        {changelogData.map((entry, idx) => (
          <VersionSection key={entry.date} versionData={entry} isOpenDefault={idx === 0} />
        ))}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#999', fontSize: '14px' }}>
          Thanks for using Circles{' '}
          <S.SnakeEmojiTrigger onClick={() => setSnakeGameOpen(true)} title="Play Snake! 🐍">
            🐍
          </S.SnakeEmojiTrigger>{' '}
          !
        </div>
      </S.Wrapper>
      <SnakeGame isOpen={snakeGameOpen} onClose={() => setSnakeGameOpen(false)} />
    </PageTemplate>
  );
};

export default ChangeLog;
