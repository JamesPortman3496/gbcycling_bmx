type RouteParams = Record<string, string>;
type RouteSearchParams = Record<string, string | string[] | undefined>;

export type AsyncPageProps<TParams extends RouteParams> = {
  params: Promise<TParams>;
};

export type AsyncPagePropsWithSearch<
  TParams extends RouteParams,
  TSearchParams extends RouteSearchParams,
> = AsyncPageProps<TParams> & {
  searchParams: Promise<TSearchParams>;
};
