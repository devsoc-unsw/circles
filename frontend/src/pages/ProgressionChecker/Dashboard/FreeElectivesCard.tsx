import React from 'react';
import { Link } from 'react-scroll';
import { Typography } from 'antd';
import S from 'components/SpecialisationCard/styles';

type Props = {
  uoc: number;
};

const FreeElectivesCard = ({ uoc }: Props) => {
  const { Title, Text } = Typography;

  return (
    <Link to="Free Electives" smooth duration={2000}>
      <S.Card hoverable bordered={false}>
        <Title className="text" level={5}>
          Free Electives
        </Title>
        <Text style={{ color: '#737372' }}>{uoc} UOC worth of additional courses planned</Text>
      </S.Card>
    </Link>
  );
};

export default FreeElectivesCard;
