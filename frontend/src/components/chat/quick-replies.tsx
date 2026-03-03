"use client";

interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
  disabled?: boolean;
}

export function QuickReplies({
  replies,
  onSelect,
  disabled = false,
}: QuickRepliesProps) {
  if (replies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 py-2 animate-fade-in" role="group" aria-label="\u0411\u044B\u0441\u0442\u0440\u044B\u0435 \u043E\u0442\u0432\u0435\u0442\u044B">
      {replies.map((reply) => (
        <button
          key={reply}
          type="button"
          className="rounded-full border border-primary-300 bg-white px-4 py-2 text-body-sm font-medium text-primary-700 transition-all hover:bg-primary-50 hover:border-primary-400 active:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onSelect(reply)}
          disabled={disabled}
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
