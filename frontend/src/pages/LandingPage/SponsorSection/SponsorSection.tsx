import React from 'react';
import { useSelector } from 'react-redux';
import PageContainer from 'styles/PageContainer';
import { RootState } from 'config/store';
import S from './styles';

type LogoProps = {
  src: string;
  href?: string;
  size: 'platinum' | 'gold' | 'silver';
};

type LogoModule = { default: string };
type Files = Record<string, () => Promise<LogoModule>>;

const URLS = {
  janestreet: 'https://www.janestreet.com',
  imc: 'https://www.imc.com/ap/',
  citadel: 'https://www.citadel.com',
  thetradedesk: 'https://www.thetradedesk.com/',
  safetyculture: 'https://www.safetyculture.com',
  arista: 'https://www.arista.com',
  lyra: 'https://www.lyratechnologies.com.au/',
  airwallex: 'https://www.airwallex.com/au'
} as const;

const LOGO_SIZES = {
  platinum: '350px',
  gold: '250px',
  silver: '150px'
} as const;

const Logo = ({ src, href, size }: LogoProps) => {
  const image = <S.LogoImg src={src} size={LOGO_SIZES[size]} />;

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {image}
    </a>
  ) : (
    image
  );
};

// Necessary to do it this way as vite does not support dynamic imports with globs
// ie needs to be a string literal
const sponsorAssets = {
  dark: {
    platinum: import.meta.glob(
      '/src/assets/LandingPage/Sponsors/Dark/Platinum/*.(png|jpg|jpeg|svg|avif)'
    ) as Files,
    gold: import.meta.glob(
      '/src/assets/LandingPage/Sponsors/Dark/Gold/*.(png|jpg|jpeg|svg|avif)'
    ) as Files,
    silver: import.meta.glob(
      '/src/assets/LandingPage/Sponsors/Dark/Silver/*.(png|jpg|jpeg|svg|avif)'
    ) as Files
  },
  light: {
    platinum: import.meta.glob(
      '/src/assets/LandingPage/Sponsors/Light/Platinum/*.(png|jpg|jpeg|svg|avif)'
    ) as Files,
    gold: import.meta.glob(
      '/src/assets/LandingPage/Sponsors/Light/Gold/*.(png|jpg|jpeg|svg|avif)'
    ) as Files,
    silver: import.meta.glob(
      '/src/assets/LandingPage/Sponsors/Light/Silver/*.(png|jpg|jpeg|svg|avif)'
    ) as Files
  }
};

const SponsorSection = () => {
  const { theme } = useSelector((state: RootState) => state.settings);
  const [logos, setLogos] = React.useState<Record<'platinum' | 'gold' | 'silver', string[]>>({
    platinum: [],
    gold: [],
    silver: []
  });

  React.useEffect(() => {
    const loadLogos = async () => {
      const { platinum, gold, silver } = sponsorAssets[theme];

      const loadTier = async (files: Files) => {
        const paths = Object.keys(files);
        const modules = await Promise.all(paths.map((path) => files[path]()));
        return paths.map((path, index) => ({
          path,
          url: modules[index].default
        }));
      };

      const [platinumLogos, goldLogos, silverLogos] = await Promise.all([
        loadTier(platinum),
        loadTier(gold),
        loadTier(silver)
      ]);

      setLogos({
        platinum: platinumLogos.map((p) => p.url),
        gold: goldLogos.map((g) => g.url),
        silver: silverLogos.map((s) => s.url)
      });
    };

    loadLogos();
  }, [theme]);

  const renderLogos = (logoUrls: string[], tier: LogoProps['size']) =>
    logoUrls.map((url) => {
      // Necessary to split on '-' as in production some tags are added to the image
      const fileName = url.split('/').pop()?.split('.')[0].split('-')[0] || '';
      return (
        <Logo
          key={`${tier}-${url}`}
          src={url}
          href={URLS[fileName as keyof typeof URLS]}
          size={tier}
        />
      );
    });

  return (
    <PageContainer>
      <S.SponsorsText>Our sponsors</S.SponsorsText>
      <S.LogosWrapper>
        <S.TierWrapper>{renderLogos(logos.platinum, 'platinum')}</S.TierWrapper>
        <S.TierWrapper>{renderLogos(logos.gold, 'gold')}</S.TierWrapper>
      </S.LogosWrapper>
    </PageContainer>
  );
};

export default SponsorSection;
