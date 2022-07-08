import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import S from "./styles";

const PageLoading = ({ setLoading }) => {
  const router = useRouter();

  const degree = useSelector((state) => state.degree);

  const { pathname } = useRouter();
  // redirect index page to course selector
  const route = pathname === "/" ? "/course-selector" : pathname;

  useEffect(() => {
    setTimeout(() => {
      // check if this is a first time user
      router.push(!degree.isComplete ? "/degree-wizard" : route);
      setLoading(false);
    }, 750);
  }, []);

  return (
    <S.PageWrapper>
      <S.LoadingLogo src="/circlesLogoWithBg.svg" alt="Circles Logo" />
    </S.PageWrapper>
  );
};

export default PageLoading;
