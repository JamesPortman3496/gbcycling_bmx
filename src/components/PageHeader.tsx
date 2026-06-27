import type { ReactNode } from "react";

export type PageHeaderProps = {
  actions?: ReactNode;
  description?: string;
  title: string;
};

export function PageHeader({
  actions,
  description,
  title,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-3xl">
        <h1 className="text-xl font-semibold text-bc-navy">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm leading-5 text-bc-dark-grey">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
