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
import { SetupFormValues } from '~/types';
import { PAY_FREQUENCY, PAYDAY_TYPE } from '~/constants';
import {
  getFrequencyOptions,
  getWeekdayOptions,
  getBankHolidayRegionOptions,
  getPaydayTypeOptions
} from '~/utils';
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
      type: frequency === PAY_FREQUENCY.WEEKLY ? PAYDAY_TYPE.SET_WEEKDAY : PAYDAY_TYPE.LAST_DAY,
      firstPayDate: frequency === PAY_FREQUENCY.MONTHLY ? undefined : paydayConfig.firstPayDate,
      dayOfMonth: undefined,
      weekday: frequency === PAY_FREQUENCY.WEEKLY ? paydayConfig.weekday : undefined
    });
  };

  const handleTypeChange = (event: any) => {
    const type = event.target.value;
    setFieldValue('paydayConfig', {
      ...paydayConfig,
      type,
      dayOfMonth: type === PAYDAY_TYPE.SET_DAY ? paydayConfig.dayOfMonth : undefined,
      weekday: type === PAYDAY_TYPE.SET_WEEKDAY ? paydayConfig.weekday : undefined
    });
  };

  const handleRegionChange = (event: any) => {
    setFieldValue('paydayConfig.bankHolidayRegion', event.target.value);
  };

  const showDayOfMonth = paydayConfig.type === PAYDAY_TYPE.SET_DAY;
  const showWeekday = paydayConfig.type === PAYDAY_TYPE.SET_WEEKDAY;
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
          {getFrequencyOptions().map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
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
          {getPaydayTypeOptions(paydayConfig.frequency).map(type => (
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
          {getBankHolidayRegionOptions().map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
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

      {showWeekday && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Day of Week</InputLabel>
          <Select
            value={paydayConfig.weekday || ''}
            label="Day of Week"
            onChange={e => setFieldValue('paydayConfig.weekday', e.target.value)}
            error={touched.paydayConfig?.weekday && Boolean(errors.paydayConfig?.weekday)}>
            {getWeekdayOptions().map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText
            error={touched.paydayConfig?.weekday && Boolean(errors.paydayConfig?.weekday)}>
            {touched.paydayConfig?.weekday && errors.paydayConfig?.weekday}
          </FormHelperText>
        </FormControl>
      )}

      {isRecurring && (
        <TextField
          fullWidth
          label="First Pay Date"
          type="date"
          value={paydayConfig.firstPayDate || ''}
          onChange={e => setFieldValue('paydayConfig.firstPayDate', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          error={touched.paydayConfig?.firstPayDate && Boolean(errors.paydayConfig?.firstPayDate)}
          helperText={touched.paydayConfig?.firstPayDate && errors.paydayConfig?.firstPayDate}
        />
      )}
    </Box>
  );
};
