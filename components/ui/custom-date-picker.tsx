"use client"

import React from 'react'
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter 
} from "@nextui-org/react"
import { Calendar } from "@nextui-org/react"

interface DateRange {
  from: Date;
  to?: Date;
}

interface DateRangePickerProps {
  date?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
  className?: string;
}

export default function DateRangePicker({
  date,
  onChange,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const formatDateDisplay = () => {
    if (!date?.from) return "Select date range";
    if (!date.to) return format(date.from, "LLL dd, y");
    return `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`;
  };

  return (
    <Popover 
      isOpen={isOpen} 
      onOpenChange={setIsOpen}
      showArrow={true}
      placement="bottom-start"
      backdrop="opaque"
    >
      <PopoverTrigger>
        <Button
          variant="bordered"
          startContent={<CalendarIcon className="h-4 w-4" />}
          className={`w-full justify-start text-left ${className}`}
        >
          {formatDateDisplay()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Card className="border-none shadow-none max-w-full">
          <CardHeader className="flex justify-between">
            <span className="text-sm font-semibold">Select Date Range</span>
          </CardHeader>
          <CardBody className="px-1 py-0">
            <Calendar
              mode="range"
              selected={{
                start: date?.from,
                end: date?.to
              }}
              onSelect={(range) => {
                if (range) {
                  onChange?.({
                    from: range.start || new Date(),
                    to: range.end
                  });
                }
                // Don't close popover immediately to allow selecting end date
                if (range?.end) {
                  setIsOpen(false);
                }
              }}
              weekStart={1}
              // Add some nice hover effects
              classNames={{
                day: "hover:bg-primary-100 dark:hover:bg-primary-800/20",
                selected: "bg-primary-500 text-white",
                inRange: "bg-primary-100 dark:bg-primary-800/30",
                today: "border border-primary-500"
              }}
            />
          </CardBody>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="light" 
              onPress={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              color="primary" 
              onPress={() => setIsOpen(false)}
            >
              Apply
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}