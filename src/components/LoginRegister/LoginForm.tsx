import { ApolloError, useLazyQuery } from '@apollo/client';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { ERRORS, EVENTS } from '~/constants';
import { LOGIN_QUERY } from '~/graphql';
import { useAccountContext } from '~/state';
import { LoginData } from '~/types';
import { AutoFocusTextField } from './AutoFocusTextField';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { dispatch } = useAccountContext();
  const [loginQuery, { loading }] = useLazyQuery<LoginData>(LOGIN_QUERY, {
    onCompleted: data => onLoginCompleted(data),
    onError: errors => onLoginError(errors)
  });

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

  const onLoginError = (errors: ApolloError) => {
    formik.setFieldValue('email', formik.values.email, false);
    formik.setFieldValue('password', '', false);

    if (errors.message === ERRORS.USER_NOT_FOUND) {
      formik.setFieldError('email', ERRORS.EMAIL_NOT_FOUND);
    } else if (errors.message === ERRORS.INCORRECT_PASSWORD) {
      formik.setFieldError('password', ERRORS.INCORRECT_PASSWORD);
    }
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email Address required'),
    password: Yup.string()
      .required(`Password required`)
      .min(8, 'Password is too short (min is 8 characters)')
      .matches(/(?=.*[0-9])/, 'Password must contain a number.')
  });

  const formik = useFormik({
    validateOnChange: false,
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      loginQuery({ variables: { ...values } });
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <AutoFocusTextField
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        variant="outlined"
        margin="normal"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        autoComplete="username"
      />
      <TextField
        fullWidth
        id="current-password"
        name="password"
        label="Password"
        type="password"
        variant="outlined"
        margin="normal"
        value={formik.values.password}
        onChange={formik.handleChange}
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
