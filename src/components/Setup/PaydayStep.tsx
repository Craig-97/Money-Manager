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
import { PaydayType, SetupFormValues, Weekday } from '~/types';

interface PaydayStepProps {
  formik: FormikProps<SetupFormValues>;
}

export const PaydayStep = ({ formik }: PaydayStepProps) => {
  const { values, setFieldValue, errors, touched } = formik;
  const { paydayConfig } = values;

  const weekdays = [
    { value: Weekday.SUNDAY, label: 'Sunday' },
    { value: Weekday.MONDAY, label: 'Monday' },
    { value: Weekday.TUESDAY, label: 'Tuesday' },
    { value: Weekday.WEDNESDAY, label: 'Wednesday' },
    { value: Weekday.THURSDAY, label: 'Thursday' },
    { value: Weekday.FRIDAY, label: 'Friday' },
    { value: Weekday.SATURDAY, label: 'Saturday' }
  ];

  const handleTypeChange = (event: any) => {
    const type = event.target.value;
    setFieldValue('paydayConfig', { type });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Payday Schedule</InputLabel>
        <Select
          value={paydayConfig.type}
          label="Payday Schedule"
          onChange={handleTypeChange}
          error={touched.paydayConfig?.type && Boolean(errors.paydayConfig?.type)}>
          <MenuItem value={PaydayType.SPECIFIC_DATE}>Same date every month</MenuItem>
          <MenuItem value={PaydayType.LAST_WORKING_DAY}>Last working day of month</MenuItem>
          <MenuItem value={PaydayType.WEEKLY}>Weekly</MenuItem>
          <MenuItem value={PaydayType.BIWEEKLY}>Every two weeks</MenuItem>
          <MenuItem value={PaydayType.SPECIFIC_WEEKDAY}>Specific week of month</MenuItem>
          <MenuItem value={PaydayType.LAST_WEEKDAY}>Last specific day of month</MenuItem>
        </Select>
        <FormHelperText error={touched.paydayConfig?.type && Boolean(errors.paydayConfig?.type)}>
          {touched.paydayConfig?.type && errors.paydayConfig?.type}
        </FormHelperText>
      </FormControl>

      {paydayConfig.type === PaydayType.SPECIFIC_DATE && (
        <TextField
          fullWidth
          label="Day of Month"
          type="number"
          InputProps={{ inputProps: { min: 1, max: 31 } }}
          value={paydayConfig.dayOfMonth || ''}
          onChange={e => setFieldValue('paydayConfig.dayOfMonth', parseInt(e.target.value))}
          error={touched.paydayConfig?.dayOfMonth && Boolean(errors.paydayConfig?.dayOfMonth)}
          helperText={touched.paydayConfig?.dayOfMonth && errors.paydayConfig?.dayOfMonth}
        />
      )}

      {[PaydayType.WEEKLY, PaydayType.BIWEEKLY].includes(paydayConfig.type) && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Day of Week</InputLabel>
            <Select
              value={paydayConfig.weekday || ''}
              label="Day of Week"
              onChange={e => setFieldValue('paydayConfig.weekday', e.target.value)}>
              {weekdays.map(day => (
                <MenuItem key={day.value} value={day.value}>
                  {day.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={paydayConfig.startDate || ''}
            onChange={e => setFieldValue('paydayConfig.startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      )}

      {paydayConfig.type === PaydayType.SPECIFIC_WEEKDAY && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Day of Week</InputLabel>
            <Select
              value={paydayConfig.weekday || ''}
              label="Day of Week"
              onChange={e => setFieldValue('paydayConfig.weekday', e.target.value)}>
              {weekdays.map(day => (
                <MenuItem key={day.value} value={day.value}>
                  {day.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Week of Month</InputLabel>
            <Select
              value={paydayConfig.weekdayOccurrence || ''}
              label="Week of Month"
              onChange={e => setFieldValue('paydayConfig.weekdayOccurrence', e.target.value)}>
              <MenuItem value={1}>First</MenuItem>
              <MenuItem value={2}>Second</MenuItem>
              <MenuItem value={3}>Third</MenuItem>
              <MenuItem value={4}>Fourth</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {paydayConfig.type === PaydayType.LAST_WEEKDAY && (
        <FormControl fullWidth>
          <InputLabel>Day of Week</InputLabel>
          <Select
            value={paydayConfig.weekday || ''}
            label="Day of Week"
            onChange={e => setFieldValue('paydayConfig.weekday', e.target.value)}>
            {weekdays.map(day => (
              <MenuItem key={day.value} value={day.value}>
                {day.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};
