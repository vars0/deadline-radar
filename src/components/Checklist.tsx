import { useState } from "react";
import type { ChecklistItem } from "../types";

export function Checklist({
  items,
  onChange,
  idPrefix,
}: {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  idPrefix: string;
}) {
  const [newItem, setNewItem] = useState("");
  const completed = items.filter((i) => i.done).length;
  function addItem() {
    if (!newItem.trim()) return;
    onChange([
      ...items,
      { id: crypto.randomUUID(), label: newItem.trim(), done: false },
    ]);
    setNewItem("");
  }
  return (
    <div className="checklist">
      <div className="checklist-heading">
        <h3>Submission checklist</h3>
        <span>
          {completed}/{items.length} ready
        </span>
      </div>
      <div
        className="progress-track"
        aria-label={`${completed} of ${items.length} tasks complete`}
      >
        <div
          style={{
            width: `${items.length ? (completed / items.length) * 100 : 0}%`,
          }}
        />
      </div>
      {items.length === 0 && (
        <p className="muted small">
          No requirements detected. Add the things you need to submit.
        </p>
      )}
      <ul className="task-list">
        {items.map((item) => (
          <li key={item.id} className={item.done ? "task done" : "task"}>
            <input
              type="checkbox"
              id={`${idPrefix}-${item.id}`}
              checked={item.done}
              onChange={() =>
                onChange(
                  items.map((i) =>
                    i.id === item.id ? { ...i, done: !i.done } : i,
                  ),
                )
              }
              aria-label={`Complete ${item.label}`}
            />
            <input
              className="task-label"
              type="text"
              value={item.label}
              aria-label={`Task: ${item.label}`}
              maxLength={160}
              onChange={(e) =>
                onChange(
                  items.map((i) =>
                    i.id === item.id ? { ...i, label: e.target.value } : i,
                  ),
                )
              }
              onBlur={() =>
                onChange(
                  items
                    .filter((i) => i.label.trim())
                    .map((i) => ({ ...i, label: i.label.trim() })),
                )
              }
            />
            <button
              type="button"
              className="icon-button"
              onClick={() => onChange(items.filter((i) => i.id !== item.id))}
              aria-label={`Remove ${item.label}`}
              title="Remove task"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="add-task">
        <input
          type="text"
          placeholder="Add a requirement…"
          aria-label="New checklist item"
          maxLength={160}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!newItem.trim()}
          aria-label="Add checklist item"
        >
          +
        </button>
      </div>
    </div>
  );
}
