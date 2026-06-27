import type { ReactNode } from "react";
import { Card } from "./Card";

export type StatCardProps = {
  detail?: string;
  label: string;
  value: ReactNode;
};

export function StatCard({
  detail,
  label,
  value,
}: StatCardProps) {
  return (
    <Card className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-bc-dark-grey">{label}</p>
        <p className="mt-1 text-xl font-semibold text-bc-navy">{value}</p>
        {detail ? (
          <p className="mt-0.5 text-xs text-bc-dark-grey/80">{detail}</p>
        ) : null}
      </div>
    </Card>
  );
}
