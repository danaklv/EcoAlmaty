import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedTreeProps {
  level: number;
}

export default function AnimatedTree({ level }: AnimatedTreeProps) {
  const [growth, setGrowth] = useState(1);

  useEffect(() => {
    setGrowth(Math.min(level, 10));
  }, [level]);

  const branchVariants = {
    hidden: { pathLength: 0, opacity: 0 } as const,
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.8 + i * 0.3 },
    }),
  };

  const leafVariants = {
    hidden: { scale: 0, opacity: 0 } as const,
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: 0.5 + i * 0.15, duration: 0.5 },
    }),
  };

  const glowVariants = {
    hidden: { opacity: 0 } as const,
    visible: {
      opacity: [0.3, 0.6, 0.3] as number[],
      transition: { duration: 2, repeat: Infinity },
    },
  };

  return (
    <div className="flex flex-col items-center my-10">
      <svg
        viewBox="0 0 300 350"
        className="w-full max-w-md h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow effect for high levels */}
        {growth >= 8 && (
          <motion.circle
            cx="150"
            cy="120"
            r="80"
            fill="hsl(var(--primary))"
            opacity="0.1"
            variants={glowVariants}
            initial="hidden"
            animate="visible"
          />
        )}

        {/* Root system (visible from level 2) */}
        {growth >= 2 && (
          <>
            <motion.path
              d="M150 320 Q140 330, 130 335"
              stroke="hsl(30, 30%, 35%)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            />
            <motion.path
              d="M150 320 Q160 330, 170 335"
              stroke="hsl(30, 30%, 35%)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            />
          </>
        )}

        {/* Main trunk */}
        <motion.path
          d="M150 320 C145 280, 148 240, 150 180"
          stroke="hsl(30, 30%, 30%)"
          strokeWidth="12"
          strokeLinecap="round"
          fill="transparent"
          variants={branchVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        />

        {/* Level 2: First primary branches */}
        {growth >= 2 && (
          <>
            <motion.path
              d="M150 220 Q130 200, 120 170"
              stroke="hsl(30, 30%, 32%)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            />
            <motion.path
              d="M150 220 Q170 200, 180 170"
              stroke="hsl(30, 30%, 32%)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            />
          </>
        )}

        {/* Level 3: Secondary branches */}
        {growth >= 3 && (
          <>
            <motion.path
              d="M120 170 Q100 150, 90 130"
              stroke="hsl(30, 30%, 35%)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={2}
            />
            <motion.path
              d="M180 170 Q200 150, 210 130"
              stroke="hsl(30, 30%, 35%)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={2}
            />
            <motion.path
              d="M150 180 C150 150, 148 130, 150 110"
              stroke="hsl(30, 30%, 32%)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={2}
            />
          </>
        )}

        {/* Level 4: More detailed branches */}
        {growth >= 4 && (
          <>
            <motion.path
              d="M90 130 Q75 115, 65 100"
              stroke="hsl(30, 30%, 37%)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={3}
            />
            <motion.path
              d="M210 130 Q225 115, 235 100"
              stroke="hsl(30, 30%, 37%)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={3}
            />
            <motion.path
              d="M150 110 Q130 90, 120 70"
              stroke="hsl(30, 30%, 37%)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={3}
            />
            <motion.path
              d="M150 110 Q170 90, 180 70"
              stroke="hsl(30, 30%, 37%)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={3}
            />
          </>
        )}

        {/* Level 5: First leaves - small clusters */}
        {growth >= 5 && (
          <>
            {[
              { cx: 65, cy: 95 },
              { cx: 235, cy: 95 },
              { cx: 120, cy: 65 },
              { cx: 180, cy: 65 },
            ].map((pos, i) => (
              <motion.circle
                key={`leaf-5-${i}`}
                cx={pos.cx}
                cy={pos.cy}
                r="8"
                fill="hsl(var(--primary))"
                opacity="0.7"
                variants={leafVariants}
                initial="hidden"
                animate="visible"
                custom={i}
              />
            ))}
          </>
        )}

        {/* Level 6: More leaves and small branches */}
        {growth >= 6 && (
          <>
            <motion.path
              d="M120 70 Q110 55, 105 45"
              stroke="hsl(30, 30%, 40%)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={4}
            />
            <motion.path
              d="M180 70 Q190 55, 195 45"
              stroke="hsl(30, 30%, 40%)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="transparent"
              variants={branchVariants}
              initial="hidden"
              animate="visible"
              custom={4}
            />
            {[
              { cx: 105, cy: 40 },
              { cx: 195, cy: 40 },
              { cx: 80, cy: 120 },
              { cx: 220, cy: 120 },
              { cx: 130, cy: 55 },
              { cx: 170, cy: 55 },
            ].map((pos, i) => (
              <motion.ellipse
                key={`leaf-6-${i}`}
                cx={pos.cx}
                cy={pos.cy}
                rx="10"
                ry="7"
                fill="hsl(var(--primary))"
                opacity="0.75"
                variants={leafVariants}
                initial="hidden"
                animate="visible"
                custom={i}
              />
            ))}
          </>
        )}

        {/* Level 7: Dense foliage */}
        {growth >= 7 && (
          <>
            {[
              { cx: 95, cy: 85 },
              { cx: 205, cy: 85 },
              { cx: 110, cy: 100 },
              { cx: 190, cy: 100 },
              { cx: 140, cy: 75 },
              { cx: 160, cy: 75 },
              { cx: 150, cy: 60 },
              { cx: 125, cy: 90 },
              { cx: 175, cy: 90 },
            ].map((pos, i) => (
              <motion.circle
                key={`leaf-7-${i}`}
                cx={pos.cx}
                cy={pos.cy}
                r="9"
                fill="hsl(var(--success))"
                opacity="0.8"
                variants={leafVariants}
                initial="hidden"
                animate="visible"
                custom={i}
              />
            ))}
          </>
        )}

        {/* Level 8: Flowers appear */}
        {growth >= 8 && (
          <>
            {[
              { cx: 100, cy: 50 },
              { cx: 200, cy: 50 },
              { cx: 150, cy: 45 },
              { cx: 125, cy: 60 },
              { cx: 175, cy: 60 },
            ].map((pos, i) => (
              <g key={`flower-${i}`}>
                <motion.circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r="6"
                  fill="hsl(var(--apple-red))"
                  opacity="0.9"
                  variants={leafVariants}
                  initial="hidden"
                  animate="visible"
                  custom={i + 2}
                />
                <motion.circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r="2"
                  fill="hsl(45, 93%, 47%)"
                  variants={leafVariants}
                  initial="hidden"
                  animate="visible"
                  custom={i + 2.5}
                />
              </g>
            ))}
          </>
        )}

        {/* Level 9: Fruits */}
        {growth >= 9 && (
          <>
            {[
              { cx: 90, cy: 110 },
              { cx: 210, cy: 110 },
              { cx: 115, cy: 85 },
              { cx: 185, cy: 85 },
              { cx: 145, cy: 95 },
              { cx: 155, cy: 95 },
            ].map((pos, i) => (
              <g key={`fruit-${i}`}>
                <motion.circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r="7"
                  fill="hsl(var(--apple-red))"
                  variants={leafVariants}
                  initial="hidden"
                  animate="visible"
                  custom={i + 3}
                />
                <motion.ellipse
                  cx={pos.cx - 1}
                  cy={pos.cy - 1}
                  rx="2"
                  ry="3"
                  fill="hsl(var(--apple-red-dark))"
                  variants={leafVariants}
                  initial="hidden"
                  animate="visible"
                  custom={i + 3.2}
                />
              </g>
            ))}
          </>
        )}

        {/* Level 10: Full mature tree with all elements and extra details */}
        {growth >= 10 && (
          <>
            {/* Extra leaves for fullness */}
            {[
              { cx: 75, cy: 105 },
              { cx: 225, cy: 105 },
              { cx: 100, cy: 75 },
              { cx: 200, cy: 75 },
              { cx: 135, cy: 85 },
              { cx: 165, cy: 85 },
              { cx: 150, cy: 70 },
              { cx: 120, cy: 95 },
              { cx: 180, cy: 95 },
              { cx: 110, cy: 110 },
              { cx: 190, cy: 110 },
            ].map((pos, i) => (
              <motion.circle
                key={`leaf-10-${i}`}
                cx={pos.cx}
                cy={pos.cy}
                r="8"
                fill="hsl(var(--success))"
                opacity="0.85"
                variants={leafVariants}
                initial="hidden"
                animate="visible"
                custom={i + 4}
              />
            ))}
            
            {/* Butterflies or birds */}
            <motion.path
              d="M70 60 Q65 58, 60 60 Q65 62, 70 60"
              fill="hsl(45, 93%, 47%)"
              variants={leafVariants}
              initial="hidden"
              animate="visible"
              custom={8}
            />
            <motion.path
              d="M230 60 Q235 58, 240 60 Q235 62, 230 60"
              fill="hsl(45, 93%, 47%)"
              variants={leafVariants}
              initial="hidden"
              animate="visible"
              custom={8.5}
            />
          </>
        )}
      </svg>

      <div className="mt-6 text-center space-y-2">
        <p className="text-2xl font-semibold" style={{ color: "hsl(var(--primary))" }}>
          Level {level}
        </p>
        <p className="text-sm text-muted-foreground">
          {level < 3 && "Your eco-tree is sprouting 🌱"}
          {level >= 3 && level < 6 && "Growing strong 🌿"}
          {level >= 6 && level < 8 && "Flourishing beautifully 🌳"}
          {level >= 8 && level < 10 && "Blooming with life 🌸"}
          {level >= 10 && "A magnificent eco-champion! 🌟"}
        </p>
      </div>
    </div>
  );
}
