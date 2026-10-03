import { useState } from 'react';
import { AmountInput } from '~/components/form/AmountInput';
import { FieldError } from '~/components/form/FieldError';
import { Label } from '~/components/form/Label';
import { PasswordInput } from '~/components/form/PasswordInput';
import { SearchInput } from '~/components/form/SearchInput';
import { TextInput } from '~/components/form/TextInput';
import { KitExample, KitSection } from './KitSection';

export const FieldsSection = () => {
  const [search, setSearch] = useState('mortgage');

  return (
    <KitSection title="Fields" source="Payment dialog, sign in, setup, notes search">
      <div className="grid gap-6 md:grid-cols-2">
        <KitExample label="Form field (48px) with muted label">
          <div className="w-full">
            <Label tone="muted" htmlFor="kit-name">
              Name
            </Label>
            <TextInput id="kit-name" placeholder="e.g. Netflix" />
          </div>
        </KitExample>
        <KitExample label="Form field with an error">
          <div className="w-full">
            <Label tone="muted" htmlFor="kit-name-error">
              Name
            </Label>
            <TextInput id="kit-name-error" invalid aria-describedby="kit-name-error-msg" />
            <FieldError id="kit-name-error-msg">Enter a name</FieldError>
          </div>
        </KitExample>
        <KitExample label="Sign in field (56px)">
          <div className="w-full">
            <Label htmlFor="kit-email">Email address</Label>
            <TextInput id="kit-email" size="lg" type="email" placeholder="you@example.com" />
          </div>
        </KitExample>
        <KitExample label="Password with show / hide, and an error">
          <div className="w-full">
            <Label htmlFor="kit-password">Password</Label>
            <PasswordInput
              id="kit-password"
              size="lg"
              defaultValue="pass"
              invalid
              aria-describedby="kit-password-error"
            />
            <FieldError id="kit-password-error" size="md">
              Password must be at least 8 characters
            </FieldError>
          </div>
        </KitExample>
        <KitExample label="Amount (form)">
          <div className="w-full">
            <Label tone="muted" htmlFor="kit-amount">
              Amount
            </Label>
            <AmountInput id="kit-amount" defaultValue="750.00" />
          </div>
        </KitExample>
        <KitExample label="Amount (hero: setup and payday)">
          <div className="w-full">
            <Label tone="muted" htmlFor="kit-balance">
              Bank balance
            </Label>
            <AmountInput id="kit-balance" size="hero" defaultValue="9,165.00" />
          </div>
        </KitExample>
        <KitExample label="Search">
          <SearchInput
            aria-label="Search notes"
            placeholder="Search notes"
            value={search}
            onChange={event => setSearch(event.target.value)}
            onClear={() => setSearch('')}
            boxClassName="w-full"
          />
        </KitExample>
        <KitExample label="Disabled">
          <TextInput aria-label="Disabled" disabled defaultValue="Can't change this" />
        </KitExample>
      </div>
    </KitSection>
  );
};
