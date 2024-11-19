import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ApolloError } from '@apollo/client';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';
import { AutoFocusTextField } from './AutoFocusTextField';
import { ERRORS } from '~/constants';
import { useRegister } from '~/hooks';
import { getGQLErrorCode } from '~/utils';

const validationSchema = Yup.object().shape({
  fname: Yup.string().required('First Name required'),
  lname: Yup.string().required('Surname required'),
  email: Yup.string().email('Invalid Email Address').required('Email Address required'),
  password: Yup.string()
    .required(`Password required`)
    .min(8, 'Password is too short (min is 8 characters)')
    .matches(/(?=.*[0-9])/, 'Password must contain a number.'),
  confirmPassword: Yup.string()
    .required(`Confirm Password required`)
    .oneOf([Yup.ref('password')], 'Passwords must match')
});

export const RegisterForm = () => {
  const { register, loading } = useRegister({
    onError: (errors: ApolloError) => {
      formik.setFieldValue('email', formik.values.email, false);
      const errorCode = getGQLErrorCode(errors);

      if (errorCode === ERRORS.USER_EXISTS) {
        formik.setFieldError('email', errors.message);
      }
    }
  });

  const formik = useFormik({
    validateOnChange: false,
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fname: '',
      lname: ''
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      register({
        email: values.email,
        password: values.password,
        firstName: values.fname,
        surname: values.lname
      });
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <AutoFocusTextField
        {...formik.getFieldProps('fname')}
        fullWidth
        id="fname"
        label="First Name"
        variant="outlined"
        margin="normal"
        error={formik.touched.fname && Boolean(formik.errors.fname)}
        helperText={formik.touched.fname && formik.errors.fname}
      />
      <TextField
        {...formik.getFieldProps('lname')}
        fullWidth
        id="lname"
        label="Surname"
        variant="outlined"
        margin="normal"
        error={formik.touched.lname && Boolean(formik.errors.lname)}
        helperText={formik.touched.lname && formik.errors.lname}
      />
      <TextField
        {...formik.getFieldProps('email')}
        fullWidth
        id="email"
        label="Email Address"
        variant="outlined"
        margin="normal"
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        autoComplete="username"
      />
      <TextField
        {...formik.getFieldProps('password')}
        fullWidth
        id="current-password"
        label="Password"
        type="password"
        variant="outlined"
        margin="normal"
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        autoComplete="current-password"
      />
      <TextField
        {...formik.getFieldProps('confirmPassword')}
        fullWidth
        id="confirm-password"
        label="Confirm Password"
        type="password"
        variant="outlined"
        margin="normal"
        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
        autoComplete="confirm-password"
      />
      <LoadingButton
        type="submit"
        loading={formik.isSubmitting || loading}
        fullWidth
        variant="contained"
        color="primary">
        Register
      </LoadingButton>
    </form>
  );
};
