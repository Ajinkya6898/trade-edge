import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatCardProps {
  description: string;
  value: string | number;
  badgeText: string;
  badgeIcon: ReactNode;
  badgeColor?: string; // tailwind color like text-green-500
  footerTitle: string;
  footerIcon?: ReactNode;
  footerDesc: string;
  borderColor?: string; // e.g. "border-l-orange-500"
}

export function StatCard({
  description,
  value,
  badgeText,
  badgeIcon,
  badgeColor = "text-gray-500",
  footerTitle,
  footerIcon,
  footerDesc,
  borderColor = "border-l-gray-500",
}: StatCardProps) {
  return (
    <Card className={`@container/card shadow-sm border-l-4 ${borderColor}`}>
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Badge variant="outline" className="flex items-center gap-1">
            <span className={badgeColor}>{badgeIcon}</span>
            {badgeText}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {footerTitle} {footerIcon}
        </div>
        <div className="text-muted-foreground">{footerDesc}</div>
      </CardFooter>
    </Card>
  );
}
