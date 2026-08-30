"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
        month: cn("flex flex-col w-full gap-3", defaultClassNames.month),
        nav: cn("flex items-center justify-between absolute inset-x-0 top-0 w-full", defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-7 text-muted-foreground/70 hover:text-foreground",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-7 text-muted-foreground/70 hover:text-foreground",
          defaultClassNames.button_next
        ),
        month_caption: cn("flex items-center justify-center h-7 w-full text-sm font-medium", defaultClassNames.month_caption),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn("text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]", defaultClassNames.weekday),
        week: cn("flex w-full mt-1", defaultClassNames.week),
        day: cn(
          "relative w-8 h-8 p-0 text-center text-sm focus-within:relative focus-within:z-20",
          defaultClassNames.day
        ),
        day_button: cn(
          "size-8 rounded-md p-0 font-normal transition-colors hover:bg-accent aria-selected:opacity-100",
          defaultClassNames.day_button
        ),
        selected: cn(
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
          defaultClassNames.selected
        ),
        today: cn("[&>button]:bg-accent [&>button]:text-accent-foreground", defaultClassNames.today),
        outside: cn("text-muted-foreground/50 aria-selected:text-muted-foreground/50", defaultClassNames.outside),
        disabled: cn("text-muted-foreground/40 opacity-50", defaultClassNames.disabled),
        range_start: cn("[&>button]:bg-primary [&>button]:text-primary-foreground", defaultClassNames.range_start),
        range_middle: cn("[&>button]:bg-accent [&>button]:text-accent-foreground rounded-none", defaultClassNames.range_middle),
        range_end: cn("[&>button]:bg-primary [&>button]:text-primary-foreground", defaultClassNames.range_end),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) => {
          const Icon = orientation === "left" ? ChevronLeftIcon : ChevronRightIcon;
          return <Icon className="size-4" {...chevronProps} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
