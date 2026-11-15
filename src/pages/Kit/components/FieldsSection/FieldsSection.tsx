import { useState } from 'react';
import {
  AmountInput,
  FieldError,
  Label,
  PasswordInput,
  SearchInput,
  TextInput
} from '~/components/form';
import { MoreOptions } from '~/components/ui';
import { KitExample } from '../KitExample';
import { KitSection } from '../KitSection';

export const FieldsSection = () => {
  const [search, setSearch] = useState('mortgage');
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <KitSection
      title="Fields"
      source="Payment dialog, account dialog, sign in, setup, notes search">
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
        <KitExample label="More options: folded, saying what's set">
          <div className="w-full">
            <MoreOptions
              summary="From Everyday · remind 1 day before"
              open={moreOpen}
              onOpenChange={setMoreOpen}>
              <div>
                <Label tone="muted" htmlFor="kit-more-for">
                  What it’s for
                </Label>
                <TextInput
                  id="kit-more-for"
                  boxClassName="bg-surface"
                  placeholder="e.g. Holiday fund"
                />
              </div>
            </MoreOptions>
          </div>
        </KitExample>
      </div>
    </KitSection>
  );
};
