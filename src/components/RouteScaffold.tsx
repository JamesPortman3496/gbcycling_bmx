import type { ReactNode } from "react";
import { Card } from "./Card";
import { PageHeader, type BreadcrumbItem } from "./PageHeader";

type RouteRow = {
  label: string;
  value: ReactNode;
};

type RouteSection = {
  rows: RouteRow[];
  title: string;
};

export type RouteScaffoldProps = {
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  breadcrumbs?: BreadcrumbItem[];
  description?: string;
  sections: RouteSection[];
  title: string;
};

export function RouteScaffold({
  actions,
  backHref,
  backLabel,
  breadcrumbs,
  description,
  sections,
  title,
}: RouteScaffoldProps) {
  return (
    <div className="space-y-4">
      <PageHeader
        actions={actions}
        backHref={backHref}
        backLabel={backLabel}
        breadcrumbs={breadcrumbs}
        description={description}
        title={title}
      />
      <section className="grid gap-3 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <h2 className="text-sm font-semibold text-bc-navy">
              {section.title}
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              {section.rows.map((row) => (
                <div
                  className="flex items-start justify-between gap-3"
                  key={row.label}
                >
                  <dt className="text-bc-dark-grey">{row.label}</dt>
                  <dd className="text-right text-bc-navy">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}
      </section>
    </div>
  );
}
