import Pagination from '@mui/material/Pagination';
import { Link } from 'react-router-dom';
import { buildAdDetailsPath } from '../../../app/config/routes';
import type { ItemsGetOut } from '../../../shared/types';

export type AdCardView = ItemsGetOut['items'][number];

const categoryTitleMap = {
  auto: 'Авто',
  electronics: 'Электроника',
  real_estate: 'Недвижимость',
};

function NeedsRevisionBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-[26px] w-fit items-center gap-[8px] rounded-[8px] bg-[#F9F1E6] px-[8px] py-[2px] ${className}`}>
      <span className="h-[6px] w-[6px] rounded-[9999px] bg-[#FAAD14]" />
      <span className="block h-[22px] whitespace-nowrap text-[14px] leading-[22px] font-normal text-[#FAAD14]">
        Требует доработок
      </span>
    </div>
  );
}

function GridAdCard({ ad }: { ad: AdCardView }) {
  const categoryTitle = categoryTitleMap[ad.category];
  const formattedPrice = ad.price == null ? 'Цена не указана' : `${ad.price} ₽`;

  return (
    <Link to={buildAdDetailsPath(ad.id)} className="block">
      <article className="relative h-[268px] w-[200px] overflow-hidden rounded-[8px] bg-white">
        <img src="/placeholder.png" alt="" className="h-[150px] w-full object-cover" />

        <div className="flex h-[118px] w-full flex-col px-[16px] pt-[16px] pb-[12px]">
          <h3 className="h-[24px] w-[168px] overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-[24px] font-normal text-black/85">
            {ad.title}
          </h3>

          <div className="h-[22px] w-[168px] text-[16px] leading-[22px] font-semibold text-black/45">
            {formattedPrice}
          </div>

          {ad.needsRevision ? <NeedsRevisionBadge /> : null}
        </div>

        <div className="absolute top-[139px] left-[16px] flex h-[22px] w-fit items-center rounded-[6px] border border-[#D9D9D9] bg-white px-[12px]">
          <span className="h-[22px] w-fit whitespace-nowrap text-[14px] leading-[22px] font-normal text-black/85">
            {categoryTitle}
          </span>
        </div>
      </article>
    </Link>
  );
}

function ListAdCard({ ad }: { ad: AdCardView }) {
  const categoryTitle = categoryTitleMap[ad.category];
  const formattedPrice = ad.price == null ? 'Цена не указана' : `${ad.price} ₽`;

  return (
    <Link to={buildAdDetailsPath(ad.id)} className="block">
      <article className="flex h-[132px] w-[1055px] overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white">
        <img src="/placeholder.png" alt="" className="h-[132px] w-[179px] shrink-0 object-cover" />

        <div className="flex min-h-[103px] flex-1 flex-col gap-[4px] py-[12px] pr-[16px] pl-[24px]">
          <p className="h-[17px] w-[90px] shrink-0 text-[14px] leading-[14px] font-normal text-[#848388]">
            {categoryTitle}
          </p>

          <h3 className="h-[24px] w-[836px] shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-[24px] font-normal text-black/85">
            {ad.title}
          </h3>

          <div className="h-[22px] w-[836px] shrink-0 text-[16px] leading-[22px] font-semibold text-black/45">
            {formattedPrice}
          </div>

          {ad.needsRevision ? <NeedsRevisionBadge className="mt-[4px]" /> : null}
        </div>
      </article>
    </Link>
  );
}

type AdsCardsShellProps = {
  items: AdCardView[];
  total: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
};

export function AdsCardsShell({
  items,
  total,
  itemsPerPage,
  currentPage,
  onPageChange,
  isLoading = false,
  viewMode = 'grid',
}: AdsCardsShellProps) {
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  if (isLoading) {
    return (
      <section className="flex h-[590px] w-[1055px] items-center justify-center rounded-[8px] bg-white">
        <p className="text-[16px] text-[#848388]">Загрузка объявлений...</p>
      </section>
    );
  }

  if (viewMode === 'list') {
    return (
      <section className="flex h-[590px] w-[1055px] flex-col gap-[10px]">
        <div className="flex flex-col gap-[10px]">
          {items.map((ad) => (
            <ListAdCard key={ad.id} ad={ad} />
          ))}
        </div>

        <div className="mt-auto pt-[4px]">
          <Pagination
            count={totalPages}
            page={currentPage}
            size="small"
            onChange={(_event, page) => onPageChange(page)}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-[590px] w-[1055px] flex-col gap-[10px]">
      <div className="grid grid-cols-5 gap-[10px]">
        {items.map((ad) => (
          <GridAdCard key={ad.id} ad={ad} />
        ))}
      </div>

      <div className="mt-auto pt-[8px]">
        <Pagination
          count={totalPages}
          page={currentPage}
          size="small"
          onChange={(_event, page) => onPageChange(page)}
        />
      </div>
    </section>
  );
}
