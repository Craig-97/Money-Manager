import { FormikErrors, FormikProps, FormikTouched } from 'formik';
import { SetupFormValues } from '~/types';

interface FieldArrayHelperParams<T> {
  formik: FormikProps<SetupFormValues>;
  fieldName: keyof SetupFormValues;
  newItem: T;
  maxItems?: number;
}

type RemoveArrayItemParams<T> = Omit<FieldArrayHelperParams<T>, 'newItem' | 'maxItems'> & {
  index: number;
};

export const handleAddArrayItem = <T>({
  formik,
  fieldName,
  newItem,
  maxItems = 10
}: FieldArrayHelperParams<T>) => {
  const currentItems = formik.values[fieldName] as T[];
  if (currentItems.length < maxItems) {
    formik.setFieldValue(fieldName, [...currentItems, newItem]);
  }
};

export const handleRemoveArrayItem = <T>({
  formik,
  fieldName,
  index
}: RemoveArrayItemParams<T>) => {
  const { touched, errors, values, setFieldValue, setTouched, setErrors } = formik;

  const touchedArray = touched[fieldName] as FormikTouched<T>[] | undefined;
  const errorsArray = errors[fieldName] as FormikErrors<T>[] | undefined;

  if (touchedArray?.length) {
    const newTouched = touchedArray.filter((_, i) => i !== index);
    setTouched({ ...touched, [fieldName]: newTouched });
  }

  if (errorsArray?.length) {
    const newErrors = errorsArray.filter((_, i) => i !== index);
    setErrors({ ...errors, [fieldName]: newErrors });
  }

  const newItems = (values[fieldName] as T[]).filter((_, i) => i !== index);
  setFieldValue(fieldName, newItems);
};
