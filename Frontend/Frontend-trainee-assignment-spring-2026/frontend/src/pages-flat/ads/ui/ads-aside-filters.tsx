import { useState } from 'react';

import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import type { ItemCategory } from '../../../shared/types';

const categoryOptions: { label: string; value: ItemCategory }[] = [
  { label: 'Авто', value: 'auto' },
  { label: 'Электроника', value: 'electronics' },
  { label: 'Недвижимость', value: 'real_estate' },
];

type AdsAsideFiltersProps = {
  selectedCategories: ItemCategory[];
  showOnlyNeedsRevision: boolean;
  onCategoryToggle: (category: ItemCategory) => void;
  onNeedsRevisionChange: (value: boolean) => void;
  onResetFilters: () => void;
};

export function AdsAsideFilters({
  selectedCategories,
  showOnlyNeedsRevision,
  onCategoryToggle,
  onNeedsRevisionChange,
  onResetFilters,
}: AdsAsideFiltersProps) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);

  return (
    <aside className="flex w-[256px] shrink-0 flex-col gap-[10px]">
      <section className="flex w-[256px] flex-col gap-[10px] rounded-[8px] bg-white p-[16px]">
        <h2 className="h-[24px] w-[69px] text-[16px] leading-[24px] font-medium text-black/85">Фильтры</h2>

        <div className="flex w-full flex-col">
          <button
            type="button"
            onClick={() => setIsCategoriesOpen((prev) => !prev)}
            className="flex h-[22px] w-full items-center justify-between gap-[4px]"
          >
            <span className="text-[14px] leading-[22px] font-normal text-black/85">Категория</span>
            <img
              src="/Down.svg"
              alt=""
              className={`h-[12px] w-[12px] shrink-0 ${isCategoriesOpen ? '' : 'rotate-180'}`}
            />
          </button>

          {isCategoriesOpen ? (
            <div className="w-full py-[8px]">
              <div className="flex w-fit flex-col gap-[8px]">
                {categoryOptions.map((category) => (
                  <label key={category.value} className="flex h-[22px] w-fit items-center gap-[8px]">
                    <Checkbox
                      size="small"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => onCategoryToggle(category.value)}
                    />
                    <span className="text-[14px] leading-[22px] font-normal text-black/85">
                      {category.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="h-px w-full bg-[#F0F0F0]" />

        <div className="flex h-[40px] w-full items-center justify-between gap-[8px]">
          <p className="h-[40px] w-[180px] text-[14px] leading-[20px] font-semibold text-black/85">
            Только требующие доработок
          </p>

          <Switch
            checked={showOnlyNeedsRevision}
            onChange={(event) => onNeedsRevisionChange(event.target.checked)}
          />
        </div>
      </section>

      <button
        type="button"
        onClick={onResetFilters}
        className="flex h-[41px] w-[256px] items-center justify-center rounded-[8px] bg-white p-[12px]"
      >
        <span
          className={`h-[17px] w-[130px] text-[14px] leading-[14px] font-normal ${
            selectedCategories.length > 0 ? 'text-black' : 'text-[#848388]'
          }`}
        >
          Сбросить фильтры
        </span>
      </button>
    </aside>
  );
}
