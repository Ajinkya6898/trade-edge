import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type StatCardProps = {
  title: string;
  value: ReactNode;
  extraInfo?: ReactNode;
  chipLabel?: string;
  icon: ReactNode;
  color?: string;
};

const StatCard = ({
  title,
  value,
  extraInfo,
  chipLabel,
  icon,
  color = "#3b82f6",
}: StatCardProps) => {
  function darkenColor(hex: string, amount = 0.2): string {
    const num = parseInt(hex.replace("#", ""), 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    r = Math.max(0, Math.floor(r * (1 - amount)));
    g = Math.max(0, Math.floor(g * (1 - amount)));
    b = Math.max(0, Math.floor(b * (1 - amount)));

    return `rgb(${r}, ${g}, ${b})`;
  }

  const iconColor = darkenColor(color, 0.2);

  return (
    <Card className="min-h-[120px]">
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
          {extraInfo && (
            <p className="text-sm text-foreground mb-1">{extraInfo}</p>
          )}
          {chipLabel && (
            <Badge
              variant="secondary"
              className="mt-2 w-fit rounded-xl px-2 py-1 text-xs font-semibold"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {chipLabel}
            </Badge>
          )}
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `${color}1A`,
            color: iconColor,
          }}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
