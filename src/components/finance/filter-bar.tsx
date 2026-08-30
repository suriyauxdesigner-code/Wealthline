"use client";

import { ListFilter, Search, X } from "lucide-react";
import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search transactions…",
  activeCount = 0,
  onClearAll,
  filters,
  right,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  activeCount?: number;
  onClearAll?: () => void;
  filters: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full max-w-xs sm:w-64">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-8"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <ListFilter /> Filters
            {activeCount > 0 && (
              <Badge className="ml-1 px-1.5 py-0" variant="default">
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 space-y-3">
          {filters}
        </PopoverContent>
      </Popover>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="text-muted-foreground">
          <X /> Clear filters
        </Button>
      )}

      <div className="ml-auto flex items-center gap-2">{right}</div>
    </div>
  );
}
