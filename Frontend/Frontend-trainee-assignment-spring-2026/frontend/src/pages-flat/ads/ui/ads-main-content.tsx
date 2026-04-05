import { AdsAsideFilters } from './ads-aside-filters';
import { AdsCardsShell } from './ads-cards-shell';
import type { ItemCategory } from '../../../shared/types';
import type { AdCardView } from './ads-cards-shell';

type AdsMainContentProps = {
  viewMode: 'grid' | 'list';
  items: AdCardView[];
  total: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  selectedCategories: ItemCategory[];
  showOnlyNeedsRevision: boolean;
  onCategoryToggle: (category: ItemCategory) => void;
  onNeedsRevisionChange: (value: boolean) => void;
  onResetFilters: () => void;
};

export function AdsMainContent({
  viewMode,
  items,
  total,
  itemsPerPage,
  currentPage,
  onPageChange,
  isLoading,
  selectedCategories,
  showOnlyNeedsRevision,
  onCategoryToggle,
  onNeedsRevisionChange,
  onResetFilters,
}: AdsMainContentProps) {
  return (
    <section className="flex min-h-[590px] w-full gap-[24px]">
      <AdsAsideFilters
        selectedCategories={selectedCategories}
        showOnlyNeedsRevision={showOnlyNeedsRevision}
        onCategoryToggle={onCategoryToggle}
        onNeedsRevisionChange={onNeedsRevisionChange}
        onResetFilters={onResetFilters}
      />
      <AdsCardsShell
        items={items}
        total={total}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={onPageChange}
        isLoading={isLoading}
        viewMode={viewMode}
      />
    </section>
  );
}
