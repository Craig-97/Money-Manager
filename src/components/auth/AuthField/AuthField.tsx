import { ReactNode } from 'react';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';

interface AuthFieldProps {
  // The input's id. Its error has the id `${id}-error`, for the input's aria-describedby.
  id: string;
  label: string;
  // Shown at the end of the label row, e.g. a "Forgot password?" link
  labelEnd?: ReactNode;
  error?: ReactNode;
  // The input, then anything under it such as the password rules
  children: ReactNode;
}

export const authErrorId = (id: string) => `${id}-error`;

/* A labelled field on the auth screens, with its error announced when it appears */
export const AuthField = ({ id, label, labelEnd, error, children }: AuthFieldProps) => (
  <div>
    {labelEnd ? (
      <div className="-mt-3 -mb-1 flex items-center justify-between gap-3">
        <Label htmlFor={id} className="m-0">
          {label}
        </Label>
        {labelEnd}
      </div>
    ) : (
      <Label htmlFor={id}>{label}</Label>
    )}
    {children}
    {error ? (
      <FieldError id={authErrorId(id)} size="md" alert>
        <span>{error}</span>
      </FieldError>
    ) : null}
  </div>
);
