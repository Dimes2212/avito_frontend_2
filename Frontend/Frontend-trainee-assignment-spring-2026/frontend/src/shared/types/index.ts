export type ItemCategory = 'auto' | 'real_estate' | 'electronics';

export type SortColumn = 'title' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export type AutoItemParams = {
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  transmission?: 'automatic' | 'manual';
  mileage?: number;
  enginePower?: number;
};

export type RealEstateItemParams = {
  type?: 'flat' | 'house' | 'room';
  address?: string;
  area?: number;
  floor?: number;
};

export type ElectronicsItemParams = {
  type?: 'phone' | 'laptop' | 'misc';
  brand?: string;
  model?: string;
  condition?: 'new' | 'used';
  color?: string;
};

export type Item = {
  id: number;
  title: string;
  description?: string;
  price: number | null;
  createdAt: string;
  updatedAt: string;
  category: ItemCategory;
  params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams;
};

export type ItemWithRevision = Item & {
  needsRevision: boolean;
};

export type ItemsGetInQuery = {
  q?: string;
  limit?: number;
  skip?: number;
  needsRevision?: boolean;
  categories?: ItemCategory[];
  sortColumn?: SortColumn;
  sortDirection?: SortDirection;
};

export type ItemsGetOut = {
  items: {
    id: number;
    category: ItemCategory;
    title: string;
    price: number | null;
    needsRevision: boolean;
  }[];
  total: number;
};

export type ItemByIdGetOut = ItemWithRevision;

export type ItemUpdateIn = {
  category: ItemCategory;
  title: string;
  description?: string;
  price: number;
  params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams;
};

export type ItemUpdateOut = {
  success: true;
};

export type ApiErrorOut = {
  success: false;
  error: unknown;
};
