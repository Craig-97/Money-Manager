import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useLazyQuery } from '@apollo/client/react';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';
import { AutoFocusTextField } from './AutoFocusTextField';
import { ERRORS, EVENTS } from '~/constants';
import { LOGIN_QUERY } from '~/graphql';
import { useUserContext } from '~/state';
import { LoginData } from '~/types';
import { getGQLErrorCode } from '~/utils';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email Address required'),
  password: Yup.string()
    .required(`Password required`)
    .min(8, 'Password is too short (min is 8 characters)')
    .matches(/(?=.*[0-9])/, 'Password must contain a number.')
});

export const LoginForm = () => {
  const navigate = useNavigate();
  const { dispatch } = useUserContext();
  const [loginQuery, { loading }] = useLazyQuery<LoginData>(LOGIN_QUERY);

  const onLoginCompleted = (response: LoginData) => {
    if (response) {
      const {
        login: { user, token }
      } = response;

      if (user && token) {
        localStorage.setItem('token', token);

        dispatch({ type: EVENTS.LOGIN, data: user });
        navigate('/');
      }
    }
  };

  const onLoginError = (error: unknown) => {
    formik.setFieldValue('email', formik.values.email, false);
    formik.setFieldValue('password', '', false);
    const errorCode = getGQLErrorCode(error);

    const message = error instanceof Error ? error.message : 'An error occurred during login';

    if (errorCode === ERRORS.USER_EMAIL_NOT_FOUND) {
      formik.setFieldError('email', message);
    } else if (errorCode === ERRORS.INVALID_CREDENTIALS) {
      formik.setFieldError('password', message);
    }
  };

  const formik = useFormik({
    validateOnChange: false,
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const { data, error } = await loginQuery({ variables: { ...values } });
      if (data) onLoginCompleted(data);
      if (error) onLoginError(error);
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <AutoFocusTextField
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
      <LoadingButton
        loading={formik.isSubmitting || loading}
        type="submit"
        fullWidth
        variant="contained"
        color="primary">
        Sign In
      </LoadingButton>
    </form>
  );
};
