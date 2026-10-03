import { Skeleton } from '~/components/ui/Skeleton';
import { Tile } from '~/components/ui/Tile';
import { KitExample, KitSection } from './KitSection';

export const SurfacesSection = () => (
  <KitSection title="Tiles and skeletons" source="Dashboard bento, loading states">
    <div className="grid gap-4 md:grid-cols-3">
      <Tile>
        <p className="text-[13px] font-semibold text-muted">Bank balance</p>
        <p className="num text-3xl font-extrabold">£9,165.00</p>
        <p className="text-sm text-muted">Lifts on hover</p>
      </Tile>
      <Tile flat>
        <p className="text-[13px] font-semibold text-muted">Monthly income</p>
        <p className="num text-3xl font-extrabold">£3,600.00</p>
        <p className="text-sm text-muted">Flat: no lift</p>
      </Tile>
      <Tile aria-busy="true" className="bg-hero-bg text-hero-text">
        <Skeleton tone="hero" className="h-4 w-24" />
        <Skeleton tone="hero" className="h-9 w-40" />
        <Skeleton tone="hero" shape="pill" className="h-7 w-32" />
      </Tile>
    </div>
    <KitExample label="Skeleton rows">
      <div className="flex w-full flex-col gap-3">
        {[0, 1, 2].map(row => (
          <div key={row} className="flex items-center gap-3">
            <Skeleton shape="pill" className="size-10" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </KitExample>
  </KitSection>
);
