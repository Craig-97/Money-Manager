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
  const { payday } = values;

  const handleFrequencyChange = (event: any) => {
    const frequency = event.target.value;
    setFieldValue('payday', {
      ...payday,
      frequency,
      type: frequency === PAY_FREQUENCY.WEEKLY ? PAYDAY_TYPE.SET_WEEKDAY : PAYDAY_TYPE.LAST_DAY,
      firstPayDate: frequency === PAY_FREQUENCY.MONTHLY ? undefined : payday.firstPayDate,
      dayOfMonth: undefined,
      weekday: frequency === PAY_FREQUENCY.WEEKLY ? payday.weekday : undefined
    });
  };

  const handleTypeChange = (event: any) => {
    const type = event.target.value;
    setFieldValue('payday', {
      ...payday,
      type,
      dayOfMonth: type === PAYDAY_TYPE.SET_DAY ? payday.dayOfMonth : undefined,
      weekday: type === PAYDAY_TYPE.SET_WEEKDAY ? payday.weekday : undefined
    });
  };

  const handleRegionChange = (event: any) => {
    setFieldValue('payday.bankHolidayRegion', event.target.value);
  };

  const showDayOfMonth = payday.type === PAYDAY_TYPE.SET_DAY;
  const showWeekday = payday.type === PAYDAY_TYPE.SET_WEEKDAY;
  const isRecurring = payday.frequency !== PAY_FREQUENCY.MONTHLY;

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
          value={payday.frequency || ''}
          label="Pay Frequency"
          onChange={handleFrequencyChange}
          error={touched.payday?.frequency && Boolean(errors.payday?.frequency)}>
          {getFrequencyOptions().map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText error={touched.payday?.frequency && Boolean(errors.payday?.frequency)}>
          {touched.payday?.frequency && errors.payday?.frequency}
        </FormHelperText>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Payday Type</InputLabel>
        <Select
          value={payday.type || ''}
          label="Payday Type"
          onChange={handleTypeChange}
          error={touched.payday?.type && Boolean(errors.payday?.type)}>
          {getPaydayTypeOptions(payday.frequency).map(type => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText error={touched.payday?.type && Boolean(errors.payday?.type)}>
          {touched.payday?.type && errors.payday?.type}
        </FormHelperText>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Bank Holiday Region</InputLabel>
        <Select
          value={payday.bankHolidayRegion || ''}
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
          value={payday.dayOfMonth || ''}
          onChange={e => setFieldValue('payday.dayOfMonth', parseInt(e.target.value))}
          error={touched.payday?.dayOfMonth && Boolean(errors.payday?.dayOfMonth)}
          helperText={touched.payday?.dayOfMonth && errors.payday?.dayOfMonth}
          sx={{ mb: 2 }}
        />
      )}

      {showWeekday && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Day of Week</InputLabel>
          <Select
            value={payday.weekday || ''}
            label="Day of Week"
            onChange={e => setFieldValue('payday.weekday', e.target.value)}
            error={touched.payday?.weekday && Boolean(errors.payday?.weekday)}>
            {getWeekdayOptions().map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText error={touched.payday?.weekday && Boolean(errors.payday?.weekday)}>
            {touched.payday?.weekday && errors.payday?.weekday}
          </FormHelperText>
        </FormControl>
      )}

      {isRecurring && (
        <TextField
          fullWidth
          label="First Pay Date"
          type="date"
          value={payday.firstPayDate || ''}
          onChange={e => setFieldValue('payday.firstPayDate', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          error={touched.payday?.firstPayDate && Boolean(errors.payday?.firstPayDate)}
          helperText={touched.payday?.firstPayDate && errors.payday?.firstPayDate}
        />
      )}
    </Box>
  );
};
