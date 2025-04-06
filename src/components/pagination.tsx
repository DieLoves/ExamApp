import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from "./ui/button";

interface PaginationProps {
  currentIndex: number;
  totalItems: number;
  onSelect: (index: number) => void;
  selectedItems?: Record<number, any>;
  isReview?: boolean;
  isAnswerCorrect?: (index: number) => boolean;
}

export function Pagination({
  currentIndex,
  totalItems,
  onSelect,
  selectedItems = {},
  isReview = false,
  isAnswerCorrect = () => false
}: PaginationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleExpanded}
        className="flex items-center justify-center w-full text-sm py-1 h-auto"
      >
        {isExpanded ? (
          <>
            Скрыть навигацию <ChevronUp className="ml-1 h-4 w-4" />
          </>
        ) : (
          <>
            Показать навигацию <ChevronDown className="ml-1 h-4 w-4" />
          </>
        )}
      </Button>

      {isExpanded && (
        <div className="flex flex-wrap justify-center gap-2 mt-2 p-2 border rounded-md bg-background/50 backdrop-blur-sm">
          {Array.from({ length: totalItems }).map((_, index) => {
            const isSelected = index === currentIndex;
            const isAnswered = selectedItems[index] !== undefined;

            let statusClass = "";
            if (isReview && isAnswered) {
              statusClass = isAnswerCorrect(index)
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white";
            } else if (isAnswered) {
              statusClass = "bg-primary text-primary-foreground";
            } else {
              statusClass = "bg-muted text-muted-foreground";
            }

            return (
              <button
                key={`pagination-${index}`}
                className={cn(
                  "h-8 w-8 rounded-full text-sm flex items-center justify-center transition-colors",
                  isSelected
                    ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                    : "",
                  statusClass
                )}
                onClick={() => onSelect(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
