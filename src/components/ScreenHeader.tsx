import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ScreenHeaderProps = {
  title: string;
  /** Show back button (default true). Ignored if `left` is set. */
  showBack?: boolean;
  /** Entire left column (e.g. calendar icon). Overrides `showBack`. */
  left?: ReactNode;
  /** Extra controls to the right of the theme toggle. */
  rightSlot?: ReactNode;
};

/**
 * One aligned row: left action · centered title · theme toggle (+ optional slot).
 */
export function ScreenHeader({ title, showBack = true, left, rightSlot }: ScreenHeaderProps) {
  const navigate = useNavigate();

  const leftNode =
    left ??
    (showBack ? (
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-foreground -ml-1 inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary"
        aria-label="Go back"
      >
        <ArrowLeft size={22} />
      </button>
    ) : (
      <span className="inline-block w-10" aria-hidden />
    ));

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 px-4 py-2">
        <div className="flex justify-start">{leftNode}</div>
        <h1 className="min-w-0 text-center text-lg font-bold leading-tight text-foreground">{title}</h1>
        <div className="flex items-center justify-end gap-2">
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
