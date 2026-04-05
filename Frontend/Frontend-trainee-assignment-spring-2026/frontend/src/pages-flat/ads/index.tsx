import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { AdsFunctionalPanel } from './ui/ads-functional-panel';
import { AdsMainContent } from './ui/ads-main-content';
import { AdsPageHeader } from './ui/ads-page-header';
import { AdsPageShell } from './ui/ads-page-shell';
import type { ItemCategory, ItemsGetOut } from '../../shared/types';
import type { AdCardView } from './ui/ads-cards-shell';

const API_BASE_URL = 'http://localhost:8080';
type SortValue =
  | 'По названию (А-Я)'
  | 'По названию (Я-А)'
  | 'По новизне (сначала новые)'
  | 'По новизне (сначала старые)'
  | 'По цене (сначала дешевле)'
  | 'По цене (сначала дороже)';

async function fetchAdsAll(): Promise<ItemsGetOut> {
  const query = new URLSearchParams({
    q: '',
    limit: '1000',
    skip: '0',
    sortColumn: 'createdAt',
    sortDirection: 'desc',
  });

  const response = await fetch(`${API_BASE_URL}/items?${query.toString()}`);

  if (!response.ok) {
    throw new Error('Не удалось загрузить объявления');
  }

  return response.json();
}

export function AdsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState<SortValue>('По новизне (сначала новые)');
  const [selectedCategories, setSelectedCategories] = useState<ItemCategory[]>([]);
  const [showOnlyNeedsRevision, setShowOnlyNeedsRevision] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = viewMode === 'grid' ? 10 : 4;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ads-all'],
    queryFn: fetchAdsAll,
  });

  const handleViewModeChange = (nextViewMode: 'grid' | 'list') => {
    setViewMode(nextViewMode);
    setCurrentPage(1);
  };

  const handleSearchValueChange = (nextValue: string) => {
    setSearchValue(nextValue);
    setCurrentPage(1);
  };

  const handleSortValueChange = (nextSortValue: SortValue) => {
    setSortValue(nextSortValue);
    setCurrentPage(1);
  };

  const handleCategoryToggle = (category: ItemCategory) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      }

      return [...prev, category];
    });
    setCurrentPage(1);
  };

  const handleNeedsRevisionChange = (nextValue: boolean) => {
    setShowOnlyNeedsRevision(nextValue);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setShowOnlyNeedsRevision(false);
    setCurrentPage(1);
  };

  const fullItems: AdCardView[] = data?.items ?? [];

  let filteredItems = [...fullItems];

  if (searchValue.trim()) {
    const queryText = searchValue.trim().toLowerCase();
    filteredItems = filteredItems.filter((item) => item.title.toLowerCase().includes(queryText));
  }

  if (selectedCategories.length > 0) {
    filteredItems = filteredItems.filter((item) => selectedCategories.includes(item.category));
  }

  if (showOnlyNeedsRevision) {
    filteredItems = filteredItems.filter((item) => item.needsRevision);
  }

  if (sortValue === 'По названию (А-Я)') {
    filteredItems.sort((item1, item2) => item1.title.localeCompare(item2.title));
  }

  if (sortValue === 'По названию (Я-А)') {
    filteredItems.sort((item1, item2) => item2.title.localeCompare(item1.title));
  }

  if (sortValue === 'По новизне (сначала старые)') {
    filteredItems.reverse();
  }

  if (sortValue === 'По цене (сначала дешевле)') {
    filteredItems.sort((item1, item2) => (item1.price ?? 0) - (item2.price ?? 0));
  }

  if (sortValue === 'По цене (сначала дороже)') {
    filteredItems.sort((item1, item2) => (item2.price ?? 0) - (item1.price ?? 0));
  }

  const total = filteredItems.length;
  const skip = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredItems.slice(skip, skip + itemsPerPage);

  return (
    <AdsPageShell>
      {isError ? <p className="text-[16px] text-red-500">Не удалось загрузить объявления</p> : null}
      <AdsPageHeader total={total} />
      <AdsFunctionalPanel
        viewMode={viewMode}
        searchValue={searchValue}
        sortValue={sortValue}
        onSearchValueChange={handleSearchValueChange}
        onSortValueChange={handleSortValueChange}
        onViewModeChange={handleViewModeChange}
      />
      <AdsMainContent
        viewMode={viewMode}
        items={pageItems}
        total={total}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
        selectedCategories={selectedCategories}
        showOnlyNeedsRevision={showOnlyNeedsRevision}
        onCategoryToggle={handleCategoryToggle}
        onNeedsRevisionChange={handleNeedsRevisionChange}
        onResetFilters={handleResetFilters}
      />
    </AdsPageShell>
  );
}
