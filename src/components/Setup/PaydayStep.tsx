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
import { PAY_FREQUENCY, PAYDAY_TYPE, SetupFormValues, BANK_HOLIDAY_REGION } from '~/types';

const frequencies = [
  { value: PAY_FREQUENCY.WEEKLY, label: 'Weekly' },
  { value: PAY_FREQUENCY.FORTNIGHTLY, label: 'Fortnightly' },
  { value: PAY_FREQUENCY.FOUR_WEEKLY, label: '4 Weekly' },
  { value: PAY_FREQUENCY.MONTHLY, label: 'Monthly' },
  { value: PAY_FREQUENCY.QUARTERLY, label: 'Quarterly' },
  { value: PAY_FREQUENCY.BIANNUAL, label: 'Biannual' },
  { value: PAY_FREQUENCY.ANNUAL, label: 'Annual' }
];

const paydayTypes = [
  { value: PAYDAY_TYPE.LAST_DAY, label: 'Last Day' },
  { value: PAYDAY_TYPE.LAST_FRIDAY, label: 'Last Friday' },
  { value: PAYDAY_TYPE.SET_DAY, label: 'Set Day' }
];

const bankHolidayRegions = [
  { value: BANK_HOLIDAY_REGION.SCOTLAND, label: 'Scotland' },
  { value: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES, label: 'England & Wales' },
  { value: BANK_HOLIDAY_REGION.NORTHERN_IRELAND, label: 'Northern Ireland' }
];

interface PaydayStepProps {
  formik: FormikProps<SetupFormValues>;
}

export const PaydayStep = ({ formik }: PaydayStepProps) => {
  const { values, setFieldValue, errors, touched } = formik;
  const { paydayConfig } = values;

  const handleFrequencyChange = (event: any) => {
    const frequency = event.target.value;
    setFieldValue('paydayConfig', {
      ...paydayConfig,
      frequency,
      startDate: frequency !== PAY_FREQUENCY.MONTHLY ? paydayConfig.startDate : undefined
    });
  };

  const handleTypeChange = (event: any) => {
    const type = event.target.value;
    setFieldValue('paydayConfig', {
      ...paydayConfig,
      type,
      dayOfMonth: type === PAYDAY_TYPE.SET_DAY ? paydayConfig.dayOfMonth : undefined
    });
  };

  const handleRegionChange = (event: any) => {
    setFieldValue('paydayConfig.bankHolidayRegion', event.target.value);
  };

  const showDayOfMonth = paydayConfig.type === PAYDAY_TYPE.SET_DAY;
  const isRecurring = paydayConfig.frequency !== PAY_FREQUENCY.MONTHLY;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Configure your payday settings to help us accurately track your income, forecast your
        finances and generate alerts. We'll automatically adjust for weekends and bank holidays.
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

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Bank Holiday Region</InputLabel>
        <Select
          value={paydayConfig.bankHolidayRegion || ''}
          label="Bank Holiday Region"
          onChange={handleRegionChange}>
          {bankHolidayRegions.map(region => (
            <MenuItem key={region.value} value={region.value}>
              {region.label}
            </MenuItem>
          ))}
        </Select>
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
          slotProps={{ inputLabel: { shrink: true } }}
          error={touched.paydayConfig?.startDate && Boolean(errors.paydayConfig?.startDate)}
          helperText={touched.paydayConfig?.startDate && errors.paydayConfig?.startDate}
        />
      )}
    </Box>
  );
};
