import { ReactNode } from 'react';

type AdsPageShellProps = {
  children: ReactNode;
};

export function AdsPageShell({ children }: AdsPageShellProps) {
  return (
    <div className="min-h-screen w-full bg-[#F7F5F8]">
      <main className="mx-auto flex min-h-screen w-full max-w-[1399px] flex-col gap-[16px] px-[32px] pt-[12px] pb-[12px]">
        {children}
      </main>
    </div>
  );
}
