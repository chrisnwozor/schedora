import { ReactNode } from "react";

export function ModuleHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="border-b border-neutral-200 px-6 py-6 lg:px-10">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-neutral-600">{description}</p>
        </div>

        {action ? <div>{action}</div> : null}
      </div>
    </header>
  );
}
