import { act, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showToast, useToastStore } from '~/state/toast';
import { Button } from './Button';
import { Modal } from './Modal';
import { SegmentedControl } from './SegmentedControl';
import { Toaster } from './Toaster';
import { setViewportWidth } from '~/test/viewport';

afterEach(() => {
  useToastStore.setState(useToastStore.getInitialState(), true);
});

describe('Button', () => {
  it('keeps both labels so its width never changes, but only names the visible one', () => {
    const { rerender } = render(<Button loadingText="Saving…">Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

    rerender(
      <Button loading loadingText="Saving…">
        Save
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Saving…' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});

describe('SegmentedControl', () => {
  const Range = ({ onChange = vi.fn() }: { onChange?: (value: string) => void }) => {
    const [value, setValue] = useState('12');
    return (
      <SegmentedControl
        aria-label="Forecast range"
        value={value}
        onValueChange={next => {
          setValue(next);
          onChange(next);
        }}
        options={[
          { value: '6', label: '6 months' },
          { value: '12', label: '1 year', count: 3 }
        ]}
      />
    );
  };

  it('selects a segment and always keeps one selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Range onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: '6 months' }));
    expect(screen.getByRole('radio', { name: '6 months' })).toBeChecked();

    // Clicking the selected one again doesn't clear it
    await user.click(screen.getByRole('radio', { name: '6 months' }));
    expect(screen.getByRole('radio', { name: '6 months' })).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('moves between segments with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Range />);

    await user.click(screen.getByRole('radio', { name: /1 year/ }));
    await user.keyboard('{ArrowLeft}');

    expect(screen.getByRole('radio', { name: '6 months' })).toHaveFocus();
  });
});

describe('Modal', () => {
  const Example = () => {
    const [open, setOpen] = useState(true);
    return (
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Recurring payment"
        footer={<Button>Save</Button>}>
        <label>
          Name
          <input />
        </label>
      </Modal>
    );
  };

  it('is a labelled dialog that Escape closes', async () => {
    const user = userEvent.setup();
    render(<Example />);

    expect(screen.getByRole('dialog', { name: 'Recurring payment' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes from its close button', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('is a bottom sheet with a grab handle on mobile', () => {
    setViewportWidth(390);
    render(<Example />);

    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('bottom-0');
    expect(dialog.className).toContain('rounded-t-[28px]');
  });
});

describe('Toaster', () => {
  it('shows a toast and runs its action', async () => {
    const user = userEvent.setup();
    const undo = vi.fn();
    render(<Toaster />);

    act(() => showToast({ message: 'Note deleted', action: { label: 'Undo', onClick: undo } }));

    expect(await screen.findByText('Note deleted')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(undo).toHaveBeenCalledTimes(1);
  });

  it('removes a dismissed toast', async () => {
    const user = userEvent.setup();
    render(<Toaster />);

    act(() => showToast({ message: 'Payment added' }));
    await user.click(await screen.findByRole('button', { name: 'Dismiss' }));

    await waitFor(() => expect(useToastStore.getState().toasts).toHaveLength(0));
    expect(screen.queryByText('Payment added')).not.toBeInTheDocument();
  });
});
