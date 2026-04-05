import type { ItemByIdGetOut } from '../../../shared/types';

type AdDetailsDescriptionProps = {
  item: ItemByIdGetOut;
};

export function AdDetailsDescription({ item }: AdDetailsDescriptionProps) {
  const description = item.description?.trim() ? item.description : 'Отсутствует';

  return (
    <section className="flex min-h-[132px] w-[480px] flex-col gap-[16px]">
      <h2 className="h-[28px] w-[101px] text-[22px] leading-[28px] font-medium text-black/85">Описание</h2>

      <p className="m-[0px] min-h-[88px] w-[480px] text-[16px] leading-[22px] font-normal text-[#1E1E1E]">
        {description}
      </p>
    </section>
  );
}
