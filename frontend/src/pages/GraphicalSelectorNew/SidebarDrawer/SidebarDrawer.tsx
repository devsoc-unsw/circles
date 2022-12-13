/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
// import { DoubleRightOutlined } from '@ant-design/icons';
import { AiOutlineDoubleLeft, AiOutlineDoubleRight } from 'react-icons/ai';
import S from './styles';

type Props = {
  children: React.ReactNode;
};

const SidebarDrawer = ({ children }: Props) => {
  const [open, setOpen] = useState<boolean | undefined>(undefined);

  return (
    <S.Wrapper open={open}>
      <S.ArrowWrapper onClick={() => setOpen(!open)}>
        {/* open ? <AiOutlineDoubleRight /> : <AiOutlineDoubleLeft /> */}
      </S.ArrowWrapper>
      <S.ChildrenWrapper>{children}</S.ChildrenWrapper>
    </S.Wrapper>
  );
};

export default SidebarDrawer;
