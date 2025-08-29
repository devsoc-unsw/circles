import React from 'react';
import { Progress, Rate, Typography } from 'antd';
import { useTheme } from 'styled-components';
import { useCourseRatingQuery } from 'utils/apiHooks/static';
import CS from '../common/styles';
import S from './styles';

const { Title } = Typography;

interface UnilectiveReviewProps {
  courseCode: string;
}

const UnilectiveReview: React.FC<UnilectiveReviewProps> = ({ courseCode }) => {
  const theme = useTheme();
  const ratingQuery = useCourseRatingQuery({}, courseCode);
  const rating = ratingQuery.data;

  if (ratingQuery.isLoading) {
    return <CS.TextWrapper>Loading unilective reviews...</CS.TextWrapper>;
  }

  if (ratingQuery.isError || !rating) {
    return (
      <CS.TextWrapper>
        <p>No unilective reviews available for this course.</p>
        <S.Link
          href={`https://unilectives.devsoc.app/course/${courseCode}/`}
          target="_blank"
          rel="noreferrer"
        >
          View this course on Unilectives
        </S.Link>
      </CS.TextWrapper>
    );
  }

  return (
    <S.Container>
      <Title level={2} className="text">
        {courseCode} Reviews
      </Title>

      <S.RatingSection>
        <Title level={3} className="text">
          Course Ratings
        </Title>

        <S.RatingWrapper>
          <S.DialWrapper>
            <Progress
              type="dashboard"
              percent={rating.enjoyability ? (rating.enjoyability / 5) * 100 : 0}
              format={() => `${rating.enjoyability ? rating.enjoyability.toFixed(1) : '?'} / 5`}
              strokeColor={theme.purplePrimary}
              size={80}
            />
            <S.DialLabel>Enjoyability</S.DialLabel>
          </S.DialWrapper>

          <S.DialWrapper>
            <Progress
              type="dashboard"
              percent={rating.usefulness ? (rating.usefulness / 5) * 100 : 0}
              format={() => `${rating.usefulness ? rating.usefulness.toFixed(1) : '?'} / 5`}
              strokeColor={theme.purplePrimary}
              size={80}
            />
            <S.DialLabel>Usefulness</S.DialLabel>
          </S.DialWrapper>

          <S.DialWrapper>
            <Progress
              type="dashboard"
              percent={rating.manageability ? (rating.manageability / 5) * 100 : 0}
              format={() => `${rating.manageability ? rating.manageability.toFixed(1) : '?'} / 5`}
              strokeColor={theme.purplePrimary}
              size={80}
            />
            <S.DialLabel>Manageability</S.DialLabel>
          </S.DialWrapper>
        </S.RatingWrapper>

        <S.OverallRating>
          <Rate disabled value={rating.overallRating ? rating.overallRating : 0} allowHalf />
          <p>Overall Rating</p>
          {rating.reviewCount && (
            <p className="review-count">Based on {rating.reviewCount} reviews</p>
          )}
        </S.OverallRating>
      </S.RatingSection>

      <S.LinkSection>
        <S.Link
          href={`https://unilectives.devsoc.app/course/${courseCode}/`}
          target="_blank"
          rel="noreferrer"
        >
          View full reviews and write your own review on Unilectives →
        </S.Link>
      </S.LinkSection>
    </S.Container>
  );
};

export default UnilectiveReview;
