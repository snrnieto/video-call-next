import { useState, useEffect } from "react";

export const useIsVisible = () => {
  const [isVisible, setIsVisible] = useState(true);
  console.log({ isVisible });

  useEffect(() => {
    const handleVisibility = () => {
      if (window.scrollY > window.innerHeight / 2) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleVisibility);

    return () => {
      window.removeEventListener("scroll", handleVisibility);
    };
  }, []);

  return {
    isVisible,
  };
};
