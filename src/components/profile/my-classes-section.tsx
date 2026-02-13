import { ClassBadge } from "./class-badge";
import type { Class } from "@/types/class";

export interface MyClassesSectionProps {
  classes: Class[];
  title?: string;
}

export function MyClassesSection({
  classes,
  title = "My Classes",
}: MyClassesSectionProps) {
  if (classes.length === 0) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-100">
          {title}
        </h2>
        <p className="text-sm text-slate-400">
          No classes enrolled yet.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-slate-100">
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {classes.map((cls) => (
          <ClassBadge key={cls.id} name={cls.name} code={cls.code} />
        ))}
      </div>
    </section>
  );
}
