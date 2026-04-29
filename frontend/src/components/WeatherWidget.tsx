import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, Sun } from "lucide-react";

export type TimeOfDay = "morning" | "day" | "evening" | "night";
export type Weather = "sunny" | "cloudy" | "rainy" | "snowy";
export type Season = "spring" | "summer" | "autumn" | "winter";

interface WeatherWidgetProps {
  temperature?: number;
  weather?: Weather;
  timeOfDay?: TimeOfDay;
  season?: Season;
  className?: string;
}

export default function WeatherWidget({
  temperature = 22,
  weather = "sunny",
  timeOfDay: manualTimeOfDay,
  season: manualSeason,
  className = "",
}: WeatherWidgetProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(manualTimeOfDay || "day");
  const [season, setSeason] = useState<Season>(manualSeason || "summer");

  useEffect(() => {
    if (!manualTimeOfDay) {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) setTimeOfDay("morning");
      else if (hour >= 11 && hour < 17) setTimeOfDay("day");
      else if (hour >= 17 && hour < 20) setTimeOfDay("evening");
      else setTimeOfDay("night");
    }

    if (!manualSeason) {
      const month = new Date().getMonth();
      if (month >= 2 && month <= 4) setSeason("spring");
      else if (month >= 5 && month <= 7) setSeason("summer");
      else if (month >= 8 && month <= 10) setSeason("autumn");
      else setSeason("winter");
    }
  }, [manualTimeOfDay, manualSeason]);

  const getBackgroundGradient = () => {
    switch (timeOfDay) {
      case "morning":
        return "bg-gradient-to-br from-[hsl(var(--dawn-sky-start))] to-[hsl(var(--dawn-sky-end))]";
      case "day":
        return "bg-gradient-to-br from-[hsl(var(--day-sky-start))] to-[hsl(var(--day-sky-end))]";
      case "evening":
        return "bg-gradient-to-br from-[hsl(var(--dusk-sky-start))] to-[hsl(var(--dusk-sky-end))]";
      case "night":
        return "bg-gradient-to-br from-[hsl(var(--night-sky-start))] to-[hsl(var(--night-sky-end))]";
      default:
        return "bg-gradient-to-br from-[hsl(var(--day-sky-start))] to-[hsl(var(--day-sky-end))]";
    }
  };

  const getWeatherIcon = () => {
    const iconClass = "w-12 h-12";
    switch (weather) {
      case "sunny":
        return <Sun className={iconClass} />;
      case "cloudy":
        return <Cloud className={iconClass} />;
      case "rainy":
        return <CloudRain className={iconClass} />;
      case "snowy":
        return <CloudSnow className={iconClass} />;
      default:
        return <Sun className={iconClass} />;
    }
  };

  const getWeatherDescription = () => {
    return weather.charAt(0).toUpperCase() + weather.slice(1);
  };

  const getSeasonalAccent = () => {
    switch (season) {
      case "spring":
        return "text-[hsl(var(--spring-flower))]";
      case "summer":
        return "text-[hsl(var(--sun-glow))]";
      case "autumn":
        return "text-[hsl(var(--autumn-leaf))]";
      case "winter":
        return "text-[hsl(var(--snow-flake))]";
      default:
        return "text-[hsl(var(--sun-glow))]";
    }
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl shadow-lg w-64 h-40 ${className}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background */}
      <div className={`absolute inset-0 ${getBackgroundGradient()} transition-all duration-1000`}>
        {/* Floating particles based on weather */}
        {weather === "rainy" && (
          <>
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={`rain-${i}`}
                className="absolute w-0.5 h-4 bg-[hsl(var(--rain-drop))] opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-10%",
                }}
                animate={{
                  y: ["0vh", "50vh"],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </>
        )}

        {weather === "snowy" && (
          <>
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={`snow-${i}`}
                className="absolute w-1.5 h-1.5 bg-[hsl(var(--snow-flake))] rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-5%",
                }}
                animate={{
                  y: ["0vh", "50vh"],
                  x: [0, Math.sin(i) * 10, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random(),
                }}
              />
            ))}
          </>
        )}

        {(weather === "cloudy" || weather === "rainy") && (
          <>
            {Array.from({ length: 2 }).map((_, i) => (
              <motion.div
                key={`cloud-${i}`}
                className="absolute"
                style={{
                  top: `${10 + i * 20}%`,
                  left: "-20%",
                }}
                animate={{
                  x: ["-20%", "120%"],
                }}
                transition={{
                  duration: 15 + i * 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <svg width="50" height="25" viewBox="0 0 50 25">
                  <ellipse
                    cx="12"
                    cy="15"
                    rx="10"
                    ry="8"
                    fill="hsl(var(--cloud-light))"
                    opacity="0.6"
                  />
                  <ellipse
                    cx="25"
                    cy="12"
                    rx="12"
                    ry="9"
                    fill="hsl(var(--cloud-light))"
                    opacity="0.6"
                  />
                  <ellipse
                    cx="35"
                    cy="15"
                    rx="10"
                    ry="7"
                    fill="hsl(var(--cloud-light))"
                    opacity="0.6"
                  />
                </svg>
              </motion.div>
            ))}
          </>
        )}

        {timeOfDay === "night" && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: `${Math.random() * 50}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random(),
                }}
              />
            ))}
          </>
        )}

        {season === "spring" && weather === "sunny" && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={`petal-${i}`}
                className="absolute w-2 h-2 bg-[hsl(var(--spring-flower))] rounded-full opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-5%",
                }}
                animate={{
                  y: ["0vh", "50vh"],
                  x: [0, Math.sin(i) * 15, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </>
        )}

        {season === "autumn" && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={`autumn-leaf-${i}`}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-5%",
                }}
                animate={{
                  y: ["0vh", "50vh"],
                  x: [0, Math.sin(i) * 20, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 6 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 2,
                }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8">
                  <path
                    d="M4 0 Q5 2.5, 8 4 Q5 5.5, 4 8 Q3 5.5, 0 4 Q3 2.5, 4 0"
                    fill={i % 2 === 0 ? "hsl(var(--autumn-leaf))" : "hsl(var(--autumn-leaf-dark))"}
                  />
                </svg>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-6">
        <motion.div
          className={`${getSeasonalAccent()} drop-shadow-lg`}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {getWeatherIcon()}
        </motion.div>

        <motion.div
          className="text-5xl font-bold mt-3 drop-shadow-lg"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {temperature}°C
        </motion.div>

        <motion.div
          className="text-sm font-medium mt-1 drop-shadow-md opacity-90"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {getWeatherDescription()}
        </motion.div>
      </div>
    </motion.div>
  );
}
