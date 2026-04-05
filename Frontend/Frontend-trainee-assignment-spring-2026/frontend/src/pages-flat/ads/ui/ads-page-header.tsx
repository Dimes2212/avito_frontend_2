type AdsPageHeaderProps = {
  total: number;
};

export function AdsPageHeader({ total }: AdsPageHeaderProps) {
  return (
    <header className="flex min-h-[74px] w-[1335px] items-center gap-[10px] rounded-[16px] px-[8px]">
      <div className="flex min-h-[74px] w-[436px] flex-col justify-center py-[12px]">
        <h1 className="min-h-[28px] w-[176px] whitespace-nowrap text-[22px] leading-[28px] font-medium text-black/85">
          Мои объявления
        </h1>

        <p className="min-h-[22px] w-[133px] whitespace-nowrap text-[18px] leading-[22px] font-normal text-[#848388]">
          {total} объявления
        </p>
      </div>
    </header>
  );
}
