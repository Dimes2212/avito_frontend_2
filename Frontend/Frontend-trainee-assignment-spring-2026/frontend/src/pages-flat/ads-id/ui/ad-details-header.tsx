import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

import { APP_ROUTES, buildAdEditPath } from '../../../app/config/routes';
import type { ItemByIdGetOut } from '../../../shared/types';

type AdDetailsHeaderProps = {
  item: ItemByIdGetOut;
};

function formatPrice(price: number | null): string {
  if (price == null) {
    return 'Цена не указана';
  }

  return `${price} ₽`;
}

function formatDateTime(dateValue: string): string {
  const date = new Date(dateValue);
  const datePart = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
  const timePart = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${datePart} ${timePart}`;
}

export function AdDetailsHeader({ item }: AdDetailsHeaderProps) {
  return (
    <header className="flex w-full flex-col gap-[12px] border-b border-[#F0F0F0] pb-[16px]">
      <section className="flex h-[40px] w-full items-center justify-between">
        <h1 className="h-[40px] w-[942px] overflow-hidden text-ellipsis whitespace-nowrap text-[30px] leading-[40px] font-medium text-black/85">
          {item.title}
        </h1>

        <p className="h-[40px] w-fit whitespace-nowrap text-[36px] leading-[40px] font-medium text-black/85">
          {formatPrice(item.price)}
        </p>
      </section>

      <section className="flex min-h-[42px] w-full items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <Button
            component={Link}
            to={buildAdEditPath(item.id)}
            variant="contained"
            size="small"
            className="!h-[38px] !w-[170px]"
          >
            Редактировать
          </Button>
          <Button
            component={Link}
            to={APP_ROUTES.ads}
            variant="outlined"
            size="small"
            className="!h-[38px] !w-[170px]"
          >
            Отменить
          </Button>
        </div>

        <div className="flex h-[42px] w-[266px] flex-col items-end justify-center">
          <p className="h-[19px] w-[240px] whitespace-nowrap text-right text-[16px] leading-[16px] font-normal text-[#848388]">
            Опубликовано: {formatDateTime(item.createdAt)}
          </p>
          <p className="h-[19px] w-[266px] whitespace-nowrap text-right text-[16px] leading-[16px] font-normal text-[#848388]">
            Отредактировано: {formatDateTime(item.updatedAt)}
          </p>
        </div>
      </section>
    </header>
  );
}
