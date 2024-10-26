import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import { FormikProps } from 'formik';
import { PayFrequency, PaydayType, SetupFormValues } from '~/types';

interface PaydayStepProps {
  formik: FormikProps<SetupFormValues>;
}

export const PaydayStep = ({ formik }: PaydayStepProps) => {
  const { values, setFieldValue, errors, touched } = formik;
  const { paydayConfig } = values;

  const frequencies = [
    { value: PayFrequency.WEEKLY, label: 'Weekly' },
    { value: PayFrequency.FORTNIGHTLY, label: 'Fortnightly' },
    { value: PayFrequency.FOUR_WEEKLY, label: '4 Weekly' },
    { value: PayFrequency.MONTHLY, label: 'Monthly' },
    { value: PayFrequency.QUARTERLY, label: 'Quarterly' },
    { value: PayFrequency.BIANNUAL, label: 'Biannual' },
    { value: PayFrequency.ANNUAL, label: 'Annual' }
  ];

  const paydayTypes = [
    { value: PaydayType.LAST_DAY, label: 'Last Day' },
    { value: PaydayType.LAST_WEEKDAY, label: 'Last Weekday' },
    { value: PaydayType.LAST_FRIDAY, label: 'Last Friday' },
    { value: PaydayType.SET_DAY, label: 'Set Day' },
    { value: PaydayType.SET_DAY_OR_BEFORE, label: 'Set Day or Previous Workday' }
  ];

  const handleFrequencyChange = (event: any) => {
    const frequency = event.target.value;
    setFieldValue('paydayConfig', { ...paydayConfig, frequency });
  };

  const handleTypeChange = (event: any) => {
    const type = event.target.value;
    setFieldValue('paydayConfig', {
      ...paydayConfig,
      type,
      // Clear dayOfMonth if not SET_DAY or SET_DAY_OR_BEFORE
      dayOfMonth: [PaydayType.SET_DAY, PaydayType.SET_DAY_OR_BEFORE].includes(type)
        ? paydayConfig.dayOfMonth
        : undefined
    });
  };

  const showDayOfMonth = [PaydayType.SET_DAY, PaydayType.SET_DAY_OR_BEFORE].includes(
    paydayConfig.type
  );
  const isRecurring = paydayConfig.frequency !== PayFrequency.MONTHLY;

  return (
    <Box sx={{ mt: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Pay Frequency</InputLabel>
        <Select
          value={paydayConfig.frequency || ''}
          label="Pay Frequency"
          onChange={handleFrequencyChange}
          error={touched.paydayConfig?.frequency && Boolean(errors.paydayConfig?.frequency)}>
          {frequencies.map(freq => (
            <MenuItem key={freq.value} value={freq.value}>
              {freq.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText
          error={touched.paydayConfig?.frequency && Boolean(errors.paydayConfig?.frequency)}>
          {touched.paydayConfig?.frequency && errors.paydayConfig?.frequency}
        </FormHelperText>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Payday Type</InputLabel>
        <Select
          value={paydayConfig.type || ''}
          label="Payday Type"
          onChange={handleTypeChange}
          error={touched.paydayConfig?.type && Boolean(errors.paydayConfig?.type)}>
          {paydayTypes.map(type => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText error={touched.paydayConfig?.type && Boolean(errors.paydayConfig?.type)}>
          {touched.paydayConfig?.type && errors.paydayConfig?.type}
        </FormHelperText>
      </FormControl>

      {showDayOfMonth && (
        <TextField
          fullWidth
          label="Day of Month"
          type="number"
          InputProps={{ inputProps: { min: 1, max: 31 } }}
          value={paydayConfig.dayOfMonth || ''}
          onChange={e => setFieldValue('paydayConfig.dayOfMonth', parseInt(e.target.value))}
          error={touched.paydayConfig?.dayOfMonth && Boolean(errors.paydayConfig?.dayOfMonth)}
          helperText={
            (touched.paydayConfig?.dayOfMonth && errors.paydayConfig?.dayOfMonth) ||
            (paydayConfig.type === PaydayType.SET_DAY_OR_BEFORE
              ? 'If this day falls on a weekend, payment will be made on the previous workday'
              : '')
          }
          sx={{ mb: 2 }}
        />
      )}

      {isRecurring && (
        <TextField
          fullWidth
          label="First Pay Date"
          type="date"
          value={paydayConfig.startDate || ''}
          onChange={e => setFieldValue('paydayConfig.startDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
          error={touched.paydayConfig?.startDate && Boolean(errors.paydayConfig?.startDate)}
          helperText={touched.paydayConfig?.startDate && errors.paydayConfig?.startDate}
        />
      )}
    </Box>
  );
};
