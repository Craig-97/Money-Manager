import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
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
    { value: PaydayType.LAST_FRIDAY, label: 'Last Friday' },
    { value: PaydayType.SET_DAY, label: 'Set Day' }
  ];

  const handleFrequencyChange = (event: any) => {
    const frequency = event.target.value;
    setFieldValue('paydayConfig', {
      ...paydayConfig,
      frequency,
      startDate: frequency !== PayFrequency.MONTHLY ? paydayConfig.startDate : undefined
    });
  };

  const handleTypeChange = (event: any) => {
    const type = event.target.value;
    setFieldValue('paydayConfig', {
      ...paydayConfig,
      type,
      dayOfMonth: type === PaydayType.SET_DAY ? paydayConfig.dayOfMonth : undefined
    });
  };

  const showDayOfMonth = paydayConfig.type === PaydayType.SET_DAY;
  const isRecurring = paydayConfig.frequency !== PayFrequency.MONTHLY;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Configure your payday settings to help us accurately track your income and forecast your
        finances. We'll automatically adjust for weekends and bank holidays.
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Pay Frequency</InputLabel>
        <Select
          autoFocus
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

      <FormControl fullWidth sx={{ mb: 1 }}>
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
          slotProps={{
            input: { inputProps: { min: 1, max: 31 } }
          }}
          value={paydayConfig.dayOfMonth || ''}
          onChange={e => setFieldValue('paydayConfig.dayOfMonth', parseInt(e.target.value))}
          error={touched.paydayConfig?.dayOfMonth && Boolean(errors.paydayConfig?.dayOfMonth)}
          helperText={touched.paydayConfig?.dayOfMonth && errors.paydayConfig?.dayOfMonth}
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
