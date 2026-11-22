import { useState } from 'react';
import { X } from 'lucide-react';
import { logoIconUrl, readLogoInput } from '~/lib/icons';
import { IconButton, LetterIcon } from '../../ui';
import { FieldError } from '../FieldError';
import { FieldHint } from '../FieldHint';
import { Label } from '../Label';
import { TextInput } from '../TextInput';

interface LogoFieldProps {
  id: string;
  // Shown in the preview while there's no logo
  letter: string;
  value: string;
  onChange: (value: string) => void;
  // A website the hint suggests, like netflix.com
  example: string;
  // Why it can't be saved, once someone has tried
  error?: string;
}

/*
 * A payment's or account's logo, under More options: a website for its icon, or a link to an image,
 * with a preview beside it. Left empty, the letter shows. A logo that won't load shows the letter
 * too, and says so, but doesn't stop the rest saving.
 */
export const LogoField = ({ id, letter, value, onChange, example, error }: LogoFieldProps) => {
  const logo = readLogoInput(value);
  const iconUrl = logoIconUrl(logo);
  // The link that wouldn't load
  const [failed, setFailed] = useState<string>();
  const broken = !!iconUrl && failed === iconUrl;
  const problem =
    error ??
    (broken
      ? `Couldn’t load a logo from this, so the letter shows instead. Check the link, or type the website, like ${example}.`
      : undefined);
  const hint =
    logo.kind === 'site'
      ? `Using ${logo.site}’s icon. To use a different image, paste its link instead.`
      : logo.kind === 'image'
        ? 'Using this image.'
        : `Type a website, like ${example}, to use its logo, or paste a link to an image. Leave it empty to show the letter.`;

  return (
    <div>
      <Label tone="muted" htmlFor={id}>
        Logo
      </Label>
      <div className="flex items-center gap-3">
        <LetterIcon
          letter={letter}
          iconUrl={iconUrl}
          onError={() => setFailed(iconUrl ?? undefined)}
          className="size-12 rounded-[14px] text-[17px]"
          letterClassName="border border-border bg-surface text-muted"
        />
        <TextInput
          id={id}
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder="Website or image link"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          invalid={!!error}
          aria-describedby={problem ? `${id}-error` : `${id}-hint`}
          boxClassName="min-w-0 flex-1 bg-surface"
          suffix={
            value ? (
              <IconButton aria-label="Remove the logo" onClick={() => onChange('')}>
                <X size={18} aria-hidden="true" />
              </IconButton>
            ) : null
          }
        />
      </div>
      {problem ? (
        <FieldError id={`${id}-error`}>{problem}</FieldError>
      ) : (
        <FieldHint id={`${id}-hint`}>{hint}</FieldHint>
      )}
    </div>
  );
};
