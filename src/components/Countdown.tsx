import { useEffect, useState } from "react";
import { urgencyFor, urgencyLabel } from "../lib/time";

export function useNow() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export function Countdown({
  deadline,
  compact = false,
}: {
  deadline: string;
  compact?: boolean;
}) {
  const now = useNow();
  const status = urgencyFor(deadline, now);
  const seconds = Math.max(0, Math.floor((Date.parse(deadline) - now) / 1000));
  const values = [
    Math.floor(seconds / 86400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ];
  return (
    <div className={`countdown-wrap ${status} ${compact ? "compact" : ""}`}>
      <div className="countdown-caption">
        <span className="status-dot" />
        {urgencyLabel[status]}
        <span className="remaining-label">
          {status === "closed" ? "Deadline passed" : "Time remaining"}
        </span>
      </div>
      <div
        className="countdown"
        role="timer"
        aria-label={
          status === "closed"
            ? "Deadline passed"
            : `${values[0]} days, ${values[1]} hours, ${values[2]} minutes remaining`
        }
      >
        {values.map((value, i) => (
          <div className="countdown-unit" key={i}>
            <span>{String(value).padStart(2, "0")}</span>
            <small>{["days", "hours", "mins", "secs"][i]}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
