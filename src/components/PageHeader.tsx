import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export type BreadcrumbItem = {
  href?: string;
  label: string;
};

export type PageHeaderProps = {
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  description?: string;
  title: string;
};

export function PageHeader({
  actions,
  backHref,
  backLabel = "Back",
  breadcrumbs,
  description,
  title,
}: PageHeaderProps) {
  return (
    <header className="space-y-2 sm:space-y-3">
      <div className="md:hidden">
        {backHref ? (
          <Link
            className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-bc-navy transition-colors hover:text-bc-royal-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-royal-blue focus-visible:ring-offset-2"
            href={backHref}
          >
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.25} />
            <span>{backLabel}</span>
          </Link>
        ) : (
          <span />
        )}
      </div>

      {breadcrumbs?.length ? (
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1 text-xs font-medium text-bc-dark-grey md:flex"
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <span className="inline-flex items-center gap-1" key={item.label}>
                {index > 0 ? (
                  <ChevronRight
                    aria-hidden="true"
                    className="text-bc-mid-grey"
                    size={14}
                    strokeWidth={2.25}
                  />
                ) : null}
                {item.href && !isLast ? (
                  <Link
                    className="rounded-sm transition-colors hover:text-bc-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-royal-blue focus-visible:ring-offset-2"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-bc-navy" : undefined}>
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-xl font-semibold text-bc-navy">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-bc-dark-grey">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
