import type { ItemByIdGetOut } from '../../../shared/types';

type ParamFieldConfig = {
  key: string;
  label: string;
  formatValue?: (value: unknown) => string;
};

const transmissionLabelMap: Record<string, string> = {
  automatic: 'Автомат',
  manual: 'Механика',
};

const realEstateTypeLabelMap: Record<string, string> = {
  flat: 'Квартира',
  house: 'Дом',
  room: 'Комната',
};

const electronicsTypeLabelMap: Record<string, string> = {
  phone: 'Телефон',
  laptop: 'Ноутбук',
  misc: 'Другое',
};

const conditionLabelMap: Record<string, string> = {
  new: 'Новый',
  used: 'Б/у',
};

const fieldsByCategory: Record<ItemByIdGetOut['category'], ParamFieldConfig[]> = {
  auto: [
    { key: 'brand', label: 'Бренд' },
    { key: 'model', label: 'Модель' },
    { key: 'yearOfManufacture', label: 'Год выпуска' },
    {
      key: 'transmission',
      label: 'Коробка',
      formatValue: (value) => transmissionLabelMap[String(value)] ?? String(value),
    },
    { key: 'mileage', label: 'Пробег' },
    { key: 'enginePower', label: 'Мощность' },
  ],
  real_estate: [
    {
      key: 'type',
      label: 'Тип',
      formatValue: (value) => realEstateTypeLabelMap[String(value)] ?? String(value),
    },
    { key: 'address', label: 'Адрес' },
    { key: 'area', label: 'Площадь' },
    { key: 'floor', label: 'Этаж' },
  ],
  electronics: [
    {
      key: 'type',
      label: 'Тип',
      formatValue: (value) => electronicsTypeLabelMap[String(value)] ?? String(value),
    },
    { key: 'brand', label: 'Бренд' },
    { key: 'model', label: 'Модель' },
    {
      key: 'condition',
      label: 'Состояние',
      formatValue: (value) => conditionLabelMap[String(value)] ?? String(value),
    },
    { key: 'color', label: 'Цвет' },
  ],
};

function isFieldFilled(value: unknown): boolean {
  if (value == null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return true;
}

function formatFieldValue(field: ParamFieldConfig, value: unknown): string {
  if (field.formatValue) {
    return field.formatValue(value);
  }

  return String(value);
}

type AdDetailsMainInfoProps = {
  item: ItemByIdGetOut;
};

export function AdDetailsMainInfo({ item }: AdDetailsMainInfoProps) {
  const fieldConfigs = fieldsByCategory[item.category];
  const paramsRecord = item.params as Record<string, unknown>;

  const missingFields = fieldConfigs.filter((field) => !isFieldFilled(paramsRecord[field.key]));
  const filledFields = fieldConfigs
    .filter((field) => isFieldFilled(paramsRecord[field.key]))
    .map((field) => ({
      label: field.label,
      value: formatFieldValue(field, paramsRecord[field.key]),
    }));

  return (
    <section className="flex min-h-[360px] w-full gap-[32px]">
      <div className="h-[360px] w-[480px] shrink-0 overflow-hidden rounded-[8px] bg-[#FAFAFA]">
        <img src="/placeholder.png" alt="" className="h-full w-full object-cover" />
      </div>

      <div className="flex min-h-[360px] w-[527px] flex-col gap-[36px]">
        {missingFields.length > 0 ? (
          <section className="flex min-h-[118px] w-[512px] gap-[16px] rounded-[8px] bg-[#F9F1E6] px-[16px] py-[12px] shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_9px_28px_8px_rgba(0,0,0,0.05)]">
            <img src="/exclamation-circle.svg" alt="" className="mt-[2px] h-[24px] w-[24px] shrink-0" />

            <div className="flex min-h-[94px] w-[446px] flex-col gap-[4px]">
              <div className="h-[24px] w-full pr-[24px] text-[16px] leading-[24px] font-semibold text-[#1E1E1E]">
                Требуются доработки
              </div>

              <div className="w-full text-[14px] leading-[22px] font-normal text-black/85">
                {missingFields.map((field) => (
                  <p key={field.key} className="m-[0px]">
                    • {field.label}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="flex min-h-[122px] w-[527px] flex-col gap-[16px]">
          <h2 className="h-[28px] w-[169px] text-[22px] leading-[28px] font-medium text-black/85">Характеристики</h2>

          <div className="flex w-fit flex-col gap-[6px]">
            {filledFields.map((field) => (
              <div key={field.label} className="flex min-h-[22px] w-fit items-start gap-[12px]">
                <p className="m-[0px] h-[22px] w-[148px] whitespace-nowrap text-[16px] leading-[22px] font-semibold text-black/45">
                  {field.label}
                </p>
                <p className="m-[0px] h-[22px] w-fit whitespace-nowrap text-[16px] leading-[22px] font-normal text-[#1E1E1E]">
                  {field.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
