/**
 * The one heading every page opens with. Keeps the h1 in a single place so page
 * titles cannot drift apart in size or spacing.
 */
export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header>
      <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
        {title}
      </h1>
      <p className="mt-1 text-sm text-fg-muted">{description}</p>
    </header>
  );
}
