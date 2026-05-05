import { useState, useEffect } from "react";
import AnimatedBackground, { TimeOfDay, Weather, Season } from "./AnimatedBackground";
import AnimatedTree from "./AnimatedTree";

interface TreeEnvironmentProps {
  level: number;
  // Optional: allow manual control or use auto-detection
  timeOfDay?: TimeOfDay;
  weather?: Weather;
  season?: Season;
}

export default function TreeEnvironment({ 
  level,
  timeOfDay: manualTimeOfDay,
  weather: manualWeather,
  season: manualSeason,
}: TreeEnvironmentProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(manualTimeOfDay || "day");
  const [weather, setWeather] = useState<Weather>(manualWeather || "sunny");
  const [season, setSeason] = useState<Season>(manualSeason || "summer");

  useEffect(() => {
    // Auto-detect time of day based on current hour (if not manually set)
    if (!manualTimeOfDay) {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 7) setTimeOfDay("dawn");
      else if (hour >= 7 && hour < 18) setTimeOfDay("day");
      else if (hour >= 18 && hour < 20) setTimeOfDay("dusk");
      else setTimeOfDay("night");
    }

    // Auto-detect season based on current month (if not manually set)
    if (!manualSeason) {
      const month = new Date().getMonth();
      if (month >= 2 && month <= 4) setSeason("spring");
      else if (month >= 5 && month <= 7) setSeason("summer");
      else if (month >= 8 && month <= 10) setSeason("autumn");
      else setSeason("winter");
    }

    // Weather would typically come from an API - for now use manual or default
    if (manualWeather) {
      setWeather(manualWeather);
    }
  }, [manualTimeOfDay, manualWeather, manualSeason]);

  return (
    <div className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {/* Animated background */}
      <AnimatedBackground 
        timeOfDay={timeOfDay} 
        weather={weather} 
        season={season} 
      />

      {/* Tree in the center */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <AnimatedTree level={level} />
      </div>

      {/* Environment info overlay (optional - can be removed) */}
      <div className="absolute top-4 right-4 z-20 bg-card/80 backdrop-blur-sm rounded-lg p-4 text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Time:</span>
          <span className="font-semibold capitalize">{timeOfDay}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Weather:</span>
          <span className="font-semibold capitalize">{weather}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Season:</span>
          <span className="font-semibold capitalize">{season}</span>
        </div>
      </div>
    </div>
  );
}
