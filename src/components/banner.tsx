import React, { useState, useEffect } from "react";

const BANNER_DISMISSED_KEY = "countdownBannerDismissed";

const timeUnitTranslations: { [key: string]: string } = {
  days: "ngày",
  hours: "giờ",
  minutes: "phút",
  seconds: "giây",
};

export function CountdownBanner() {
  const calculateTimeLeft = () => {
    const targetDate = new Date(2026, 1, 1, 0, 0, 0);
    const difference = +targetDate - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isVisible, setIsVisible] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsVisible(sessionStorage.getItem(BANNER_DISMISSED_KEY) !== "true");
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timerComponents: JSX.Element[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval as keyof typeof timeLeft]) {
      return;
    }

    timerComponents.push(
      <span key={interval}>
        {timeLeft[interval as keyof typeof timeLeft]}{" "}
        {timeUnitTranslations[interval]}{" "}
      </span>
    );
  });

  const handleClose = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(BANNER_DISMISSED_KEY, "true");
    }
  };

  if (isVisible === undefined || isVisible === false) {
    return null;
  }

  return (
    <div className="relative bg-primary text-primary-foreground text-center py-3 text-lg">
      {timerComponents.length ? (
        <p>Sắp ra mắt... {timerComponents}</p>
      ) : (
        <p>Documents Page is here!</p>
      )}
      <button
        onClick={handleClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-primary-foreground text-xl cursor-pointer"
      >
        [✕]
      </button>
    </div>
  );
}
