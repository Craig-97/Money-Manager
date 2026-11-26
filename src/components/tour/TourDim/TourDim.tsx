import { useId } from 'react';
import { Shape } from '../useTourLayout';

// A box with each corner rounded as its own, for a window in the dim
const pathOf = ({ top: y, left: x, width: w, height: h, corners: [tl, tr, br, bl] }: Shape) =>
  [
    `M${x + tl},${y}`,
    `H${x + w - tr}`,
    `A${tr},${tr} 0 0 1 ${x + w},${y + tr}`,
    `V${y + h - br}`,
    `A${br},${br} 0 0 1 ${x + w - br},${y + h}`,
    `H${x + bl}`,
    `A${bl},${bl} 0 0 1 ${x},${y + h - bl}`,
    `V${y + tl}`,
    `A${tl},${tl} 0 0 1 ${x + tl},${y}`,
    'Z'
  ].join(' ');

/* The dimmed screen, with a window cut out for each lit area, the same shape as what it shows */
export const TourDim = ({ lit }: { lit: readonly Shape[] }) => {
  const maskId = useId();

  return (
    <svg aria-hidden="true" className="absolute inset-0 size-full">
      <defs>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill="white" />
          {lit.map(shape => (
            <path key={`${shape.top}-${shape.left}`} d={pathOf(shape)} fill="black" />
          ))}
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        mask={`url(#${maskId})`}
        style={{ fill: 'var(--overlay)' }}
      />
    </svg>
  );
};
