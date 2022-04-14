import { useEffect, useState } from "react";

export const useIntersectionObserver = (ref, config = {}) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      config
    );

    observer.observe(ref.current);
    // Remove the observer as soon as the component is unmounted
    return () => {
      observer.disconnect();
    };
  }, [config, ref]);

  return isIntersecting;
};
