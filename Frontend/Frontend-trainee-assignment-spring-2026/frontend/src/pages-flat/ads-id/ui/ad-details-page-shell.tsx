import { ReactNode } from 'react';

type AdDetailsPageShellProps = {
  children: ReactNode;
};

export function AdDetailsPageShell({ children }: AdDetailsPageShellProps) {
  return (
    <div className="min-h-screen w-full bg-[#F7F5F8]">
      <main className="mx-auto flex w-full max-w-[1399px] min-h-[865px] flex-col gap-[32px] rounded-[16px] bg-white px-[32px] pt-[32px] pb-[48px]">
        {children}
      </main>
    </div>
  );
}
