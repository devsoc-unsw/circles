import React, { useEffect, useState } from 'react';

const useIntersectionObserver = (ref: React.RefObject<HTMLElement>, config = {}) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      config
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect();
    };
  }, [config, ref]);

  return isIntersecting;
};

export default useIntersectionObserver;
