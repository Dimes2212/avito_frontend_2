import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { AdDetailsDescription } from './ui/ad-details-description';
import { AdDetailsHeader } from './ui/ad-details-header';
import { AdDetailsMainInfo } from './ui/ad-details-main-info';
import { AdDetailsPageShell } from './ui/ad-details-page-shell';
import type { ItemByIdGetOut } from '../../shared/types';

const API_BASE_URL = 'http://localhost:8080';

async function fetchItemById(id: string): Promise<ItemByIdGetOut> {
  const response = await fetch(`${API_BASE_URL}/items/${id}`);

  if (!response.ok) {
    throw new Error('Не удалось загрузить объявление');
  }

  return response.json();
}

export function AdDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ad-by-id', id],
    queryFn: () => fetchItemById(id ?? ''),
    enabled: Boolean(id),
  });

  return (
    <AdDetailsPageShell>
      {isLoading ? <p className="text-[16px] text-[#848388]">Загрузка объявления...</p> : null}
      {isError ? <p className="text-[16px] text-red-500">Не удалось загрузить объявление</p> : null}
      {data ? <AdDetailsHeader item={data} /> : null}
      {data ? <AdDetailsMainInfo item={data} /> : null}
      {data ? <AdDetailsDescription item={data} /> : null}
    </AdDetailsPageShell>
  );
}
