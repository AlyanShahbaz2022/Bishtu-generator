"use client";

import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ProductFilters,
  type FilterOptions,
} from "@/features/products/components/product-filters";

export function MobileFilters({
  options,
  hideCategories,
  hideBrands,
}: {
  options: FilterOptions;
  hideCategories?: boolean;
  hideBrands?: boolean;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-8">
          <ProductFilters
            options={options}
            hideCategories={hideCategories}
            hideBrands={hideBrands}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
