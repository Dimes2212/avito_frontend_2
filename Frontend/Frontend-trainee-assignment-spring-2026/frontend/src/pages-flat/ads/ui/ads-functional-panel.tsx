import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';

type ViewMode = 'grid' | 'list';
type SortValue =
  | 'По названию (А-Я)'
  | 'По названию (Я-А)'
  | 'По новизне (сначала новые)'
  | 'По новизне (сначала старые)'
  | 'По цене (сначала дешевле)'
  | 'По цене (сначала дороже)';

type AdsFunctionalPanelProps = {
  viewMode: ViewMode;
  searchValue: string;
  sortValue: SortValue;
  onSearchValueChange: (value: string) => void;
  onSortValueChange: (value: SortValue) => void;
  onViewModeChange: (mode: ViewMode) => void;
};

const sortOptions: SortValue[] = [
  'По названию (А-Я)',
  'По названию (Я-А)',
  'По новизне (сначала новые)',
  'По новизне (сначала старые)',
  'По цене (сначала дешевле)',
  'По цене (сначала дороже)',
];

export function AdsFunctionalPanel({
  viewMode,
  searchValue,
  sortValue,
  onSearchValueChange,
  onSortValueChange,
  onViewModeChange,
}: AdsFunctionalPanelProps) {
  const gridIconSource = viewMode === 'grid' ? '/Appstore.svg' : '/Appstore-black.svg';
  const listIconSource = viewMode === 'list' ? '/UnorderedList-blue.svg' : '/UnorderedList.svg';

  const handleSortChange = (event: SelectChangeEvent) => {
    onSortValueChange(event.target.value as SortValue);
  };

  return (
    <section className="flex min-h-[56px] w-full items-center gap-[24px] rounded-[8px] bg-white p-[12px]">
      <div className="flex h-[32px] flex-1 items-center justify-between rounded-[8px] bg-[#F6F6F8] px-[12px]">
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchValueChange(event.target.value)}
          placeholder="Найти объявление..."
          className="w-full border-none bg-transparent text-[14px] leading-[22px] text-[#2B2A2F] outline-none placeholder:text-[#A7A6AB]"
        />
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18Z"
            stroke="#949398"
            strokeWidth="1.6"
          />
          <path d="M20 20L16.65 16.65" stroke="#949398" strokeWidth="1.6" />
        </svg>
      </div>

      <div className="flex h-[32px] items-center gap-[8px] rounded-[8px] bg-[#F4F4F6] px-[8px]">
        <button
          type="button"
          aria-label="Табличный вид"
          aria-pressed={viewMode === 'grid'}
          onClick={() => onViewModeChange('grid')}
          className="grid h-[24px] w-[24px] place-items-center"
        >
          <img src={gridIconSource} alt="" className="h-[18px] w-[18px]" />
        </button>
        <span className="block h-[20px] w-px bg-[#DFDEE4]" />
        <button
          type="button"
          aria-label="Строчный вид"
          aria-pressed={viewMode === 'list'}
          onClick={() => onViewModeChange('list')}
          className="grid h-[24px] w-[24px] place-items-center"
        >
          <img src={listIconSource} alt="" className="h-[18px] w-[18px]" />
        </button>
      </div>

      <Select
        value={sortValue}
        size="small"
        onChange={handleSortChange}
        className="h-[32px] w-[240px] rounded-[8px] bg-white text-[14px]"
      >
        {sortOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </section>
  );
}
