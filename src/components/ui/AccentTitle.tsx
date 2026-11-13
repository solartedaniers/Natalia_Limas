interface AccentTitleProps {
  start: string;
  accent: string;
  end?: string;
  as?: "h1" | "h2";
  className?: string;
  accentClassName?: string;
}

export function AccentTitle({ start, accent, end, as: Tag = "h2", className = "", accentClassName = "text-lilac-ink" }: AccentTitleProps) {
  return (
    <Tag className={`font-display font-medium leading-tight ${className}`}>
      {start} <em className={accentClassName}>{accent}</em>
      {end ? ` ${end}` : null}
    </Tag>
  );
}
