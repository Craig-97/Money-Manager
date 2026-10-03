import { useState } from 'react';
import { Plus, Repeat, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { KitExample, KitSection } from './KitSection';

export const ButtonsSection = () => {
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <KitSection title="Buttons" source="Dashboard header, dialog footers, sign in">
      <KitExample label="Variants">
        <Button>
          <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
          One-off payment
        </Button>
        <Button variant="accent">
          <Repeat size={16} aria-hidden="true" />
          Recurring payment
        </Button>
        <Button variant="solid">Mark as paid</Button>
        <Button variant="danger">Delete selected</Button>
        <Button variant="dangerGhost">
          <Trash2 size={16} aria-hidden="true" />
          Delete
        </Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="accent" disabled>
          Disabled
        </Button>
      </KitExample>
      <KitExample label="Sizes: md 44, lg 48, xl 54">
        <Button variant="accent">Medium</Button>
        <Button variant="accent" size="lg">
          Large
        </Button>
        <Button variant="accent" size="xl">
          Extra large
        </Button>
      </KitExample>
      <KitExample label="Loading keeps its width (click it)">
        <Button variant="accent" loading={saving} loadingText="Saving…" onClick={save}>
          Save
        </Button>
        <Button variant="accent" size="xl" loading loadingText="Signing in…" className="w-72">
          Sign in
        </Button>
      </KitExample>
      <KitExample label="Icon buttons">
        <IconButton aria-label="Add" variant="outline">
          <Plus size={18} aria-hidden="true" />
        </IconButton>
        <IconButton aria-label="Delete">
          <Trash2 size={18} aria-hidden="true" />
        </IconButton>
      </KitExample>
    </KitSection>
  );
};
