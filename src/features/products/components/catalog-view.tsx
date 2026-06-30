import { MobileFilters } from "@/features/products/components/mobile-filters";
import { Pagination } from "@/features/products/components/pagination";
import {
  ProductFilters,
  type FilterOptions,
} from "@/features/products/components/product-filters";
import { ProductGrid } from "@/features/products/components/product-grid";
import { ProductSort } from "@/features/products/components/product-sort";
import type { ProductListResult } from "@/services/products";

/**
 * Shared catalog listing layout (filters sidebar + sorted, paginated grid).
 * Used by /products, /category/[slug], and /brand/[slug]. The filter/sort/
 * pagination controls read the current route + search params themselves.
 */
export function CatalogView({
  result,
  options,
  hideCategories,
  hideBrands,
}: {
  result: ProductListResult;
  options: FilterOptions;
  hideCategories?: boolean;
  hideBrands?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {result.total} {result.total === 1 ? "product" : "products"}
        </p>
        <div className="flex items-center gap-2">
          <MobileFilters
            options={options}
            hideCategories={hideCategories}
            hideBrands={hideBrands}
          />
          <ProductSort />
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <ProductFilters
            options={options}
            hideCategories={hideCategories}
            hideBrands={hideBrands}
          />
        </aside>
        <div>
          <ProductGrid products={result.items} />
          <Pagination page={result.page} totalPages={result.totalPages} />
        </div>
      </div>
    </div>
  );
}
