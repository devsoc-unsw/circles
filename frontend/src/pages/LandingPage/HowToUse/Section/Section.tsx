import React, { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import S from './styles';

type Props = {
  heading: string;
  number: string;
  onChange: (number: string) => void;
  children: React.ReactNode;
};

const Section = ({ heading, number, onChange, children }: Props) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0 });

  useEffect(() => {
    if (isInView) {
      onChange(number);
    }
  }, [number, onChange, isInView]);

  return (
    <section>
      <S.LeftSubTitle>{number}</S.LeftSubTitle>
      <S.ContentContainer
        style={{
          transform: isInView ? 'none' : 'translateX(-150px)',
          opacity: isInView ? 1 : 0,
          transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s'
        }}
      >
        <S.ContentHeading>{heading}</S.ContentHeading>
        <S.SubContent ref={ref}>{children}</S.SubContent>
      </S.ContentContainer>
    </section>
  );
};

export default Section;
