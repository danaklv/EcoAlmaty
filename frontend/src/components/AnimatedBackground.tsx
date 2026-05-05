import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export type TimeOfDay = "dawn" | "day" | "dusk" | "night";
export type Weather = "sunny" | "rainy" | "snowy" | "cloudy";
export type Season = "spring" | "summer" | "autumn" | "winter";

interface AnimatedBackgroundProps {
  timeOfDay: TimeOfDay;
  weather: Weather;
  season: Season;
}

export default function AnimatedBackground({
  timeOfDay,
  weather,
  season,
}: AnimatedBackgroundProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    // Generate particles for weather effects
    const particleCount = weather === "rainy" ? 50 : weather === "snowy" ? 30 : 0;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, [weather]);

  // Sky gradient based on time of day
  const getSkyGradient = () => {
    switch (timeOfDay) {
      case "dawn":
        return "bg-gradient-dawn-sky";
      case "day":
        return "bg-gradient-day-sky";
      case "dusk":
        return "bg-gradient-dusk-sky";
      case "night":
        return "bg-gradient-night-sky";
      default:
        return "bg-gradient-day-sky";
    }
  };

  // Ground color based on season
  const getGroundColor = () => {
    const baseClass = "absolute bottom-0 left-0 right-0 h-24 transition-colors duration-1000";
    switch (season) {
      case "spring":
        return `${baseClass} bg-[hsl(var(--ground-spring))]`;
      case "summer":
        return `${baseClass} bg-[hsl(var(--ground-summer))]`;
      case "autumn":
        return `${baseClass} bg-[hsl(var(--ground-autumn))]`;
      case "winter":
        return `${baseClass} bg-[hsl(var(--ground-winter))]`;
      default:
        return `${baseClass} bg-[hsl(var(--ground-summer))]`;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky */}
      <motion.div
        className={`absolute inset-0 ${getSkyGradient()}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Sun (day/dawn/dusk) */}
      {(timeOfDay === "day" || timeOfDay === "dawn" || timeOfDay === "dusk") && weather !== "cloudy" && (
        <motion.div
          className="absolute w-24 h-24 rounded-full bg-[hsl(var(--sun-glow))] blur-2xl"
          style={{
            top: timeOfDay === "day" ? "10%" : "20%",
            right: timeOfDay === "dawn" ? "70%" : timeOfDay === "dusk" ? "10%" : "15%",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 2 }}
        >
          <motion.div
            className="w-full h-full rounded-full bg-[hsl(var(--sun-glow))]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </motion.div>
      )}

      {/* Moon and stars (night) */}
      {timeOfDay === "night" && (
        <>
          <motion.div
            className="absolute w-16 h-16 rounded-full bg-[hsl(var(--moon-glow))] blur-xl top-[15%] right-[20%]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            transition={{ duration: 2 }}
          />
          {/* Stars */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </>
      )}

      {/* Clouds */}
      {(weather === "cloudy" || weather === "rainy") && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={`cloud-${i}`}
              className="absolute"
              style={{
                top: `${10 + i * 15}%`,
                left: `-10%`,
              }}
              animate={{
                x: ["0vw", "110vw"],
              }}
              transition={{
                duration: 30 + i * 10,
                repeat: Infinity,
                ease: "linear",
                delay: i * 5,
              }}
            >
              <svg width="120" height="50" viewBox="0 0 120 50">
                <ellipse
                  cx="30"
                  cy="30"
                  rx="25"
                  ry="20"
                  fill={weather === "rainy" ? "hsl(var(--cloud-dark))" : "hsl(var(--cloud-light))"}
                  opacity="0.8"
                />
                <ellipse
                  cx="60"
                  cy="25"
                  rx="30"
                  ry="22"
                  fill={weather === "rainy" ? "hsl(var(--cloud-dark))" : "hsl(var(--cloud-light))"}
                  opacity="0.8"
                />
                <ellipse
                  cx="85"
                  cy="30"
                  rx="25"
                  ry="18"
                  fill={weather === "rainy" ? "hsl(var(--cloud-dark))" : "hsl(var(--cloud-light))"}
                  opacity="0.8"
                />
              </svg>
            </motion.div>
          ))}
        </>
      )}

      {/* Rain drops */}
      {weather === "rainy" && (
        <>
          {particles.map((particle) => (
            <motion.div
              key={`rain-${particle.id}`}
              className="absolute w-0.5 h-8 bg-[hsl(var(--rain-drop))] opacity-60"
              style={{
                left: `${particle.x}%`,
                top: "-10%",
              }}
              animate={{
                y: ["0vh", "110vh"],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
                delay: particle.delay,
              }}
            />
          ))}
        </>
      )}

      {/* Snowflakes */}
      {weather === "snowy" && (
        <>
          {particles.map((particle) => (
            <motion.div
              key={`snow-${particle.id}`}
              className="absolute w-2 h-2 bg-[hsl(var(--snow-flake))] rounded-full"
              style={{
                left: `${particle.x}%`,
                top: "-5%",
              }}
              animate={{
                y: ["0vh", "105vh"],
                x: [0, Math.sin(particle.id) * 30, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                ease: "linear",
                delay: particle.delay,
              }}
            />
          ))}
        </>
      )}

      {/* Seasonal elements */}
      {/* Spring flowers */}
      {season === "spring" && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`flower-${i}`}
              className="absolute bottom-24"
              style={{
                left: `${10 + i * 12}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: i * 0.2 }}
            >
              <svg width="20" height="25" viewBox="0 0 20 25">
                <circle cx="10" cy="8" r="3" fill="hsl(var(--spring-flower))" />
                <circle cx="6" cy="10" r="3" fill="hsl(var(--spring-flower))" />
                <circle cx="14" cy="10" r="3" fill="hsl(var(--spring-flower))" />
                <circle cx="8" cy="13" r="3" fill="hsl(var(--spring-flower))" />
                <circle cx="12" cy="13" r="3" fill="hsl(var(--spring-flower))" />
                <circle cx="10" cy="11" r="2" fill="hsl(var(--sun-glow))" />
                <line x1="10" y1="13" x2="10" y2="22" stroke="hsl(var(--spring-green))" strokeWidth="2" />
              </svg>
            </motion.div>
          ))}
        </>
      )}

      {/* Autumn falling leaves */}
      {season === "autumn" && (
        <>
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`leaf-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-5%",
              }}
              animate={{
                y: ["0vh", "105vh"],
                x: [0, Math.sin(i) * 50, 0],
                rotate: [0, 360, 720],
              }}
              transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.8,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15">
                <path
                  d="M7.5 0 Q10 5, 15 7.5 Q10 10, 7.5 15 Q5 10, 0 7.5 Q5 5, 7.5 0"
                  fill={i % 2 === 0 ? "hsl(var(--autumn-leaf))" : "hsl(var(--autumn-leaf-dark))"}
                />
              </svg>
            </motion.div>
          ))}
        </>
      )}

      {/* Winter frost effect */}
      {season === "winter" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--winter-frost))]/10 to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3 }}
        />
      )}

      {/* Ground */}
      <div className={getGroundColor()}>
        {/* Ground details based on season */}
        {season === "spring" && (
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`grass-${i}`}
                className="absolute bottom-0 w-1 bg-[hsl(var(--spring-green))]"
                style={{
                  left: `${i * 5}%`,
                  height: `${Math.random() * 20 + 10}px`,
                }}
                animate={{ scaleY: [1, 1.1, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
