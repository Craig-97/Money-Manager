import { ApolloError, useMutation } from '@apollo/client';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ERRORS } from '../../constants';
import { CREATE_USER_MUTATION } from '../../graphql';
import { UserData } from '../../types';

export const RegisterForm = () => {
  const [createUser] = useMutation(CREATE_USER_MUTATION, {
    onCompleted: data => onCreateUserCompleted(data),
    onError: errors => onCreateUserError(errors)
  });

  const onCreateUserCompleted = (response: UserData) => {
    if (response) {
      const { user } = response;
      console.log('USER RESPONSE', user);
      // After registering (CreateUser) request is successful
      // the (Login) request will be fired with your new user details in the background
      // You will then navigate to a page to enter starting account details
      // Once you submit your account details you will be navigated to the homepage
    }
  };

  const onCreateUserError = (errors: ApolloError) => {
    formik.setFieldValue('email', formik.values.email, false);

    if (errors.message === ERRORS.USER_EXISTS) {
      formik.setFieldError('email', ERRORS.USER_EXISTS);
    }
  };

  const validationSchema = Yup.object().shape({
    fname: Yup.string().required('First name required'),
    lname: Yup.string().required('Surname required'),
    email: Yup.string().email('Invalid email address').required('Email Address Required'),
    password: Yup.string()
      .required(`Password required`)
      .min(8, 'Password is too short (min is 8 characters)')
      .matches(/(?=.*[0-9])/, 'Password must contain a number.'),
    confirmPassword: Yup.string()
      .required(`Confirm Password required`)
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
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
      createUser({
        variables: {
          user: {
            email: values.email,
            password: values.password,
            firstName: values.fname,
            surname: values.lname
          }
        }
      });
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <TextField
        autoFocus
        fullWidth
        id="fname"
        label="First Name"
        name="fname"
        variant="outlined"
        margin="normal"
        value={formik.values.fname}
        onChange={formik.handleChange}
        error={formik.touched.fname && Boolean(formik.errors.fname)}
        helperText={formik.touched.fname && formik.errors.fname}
      />
      <TextField
        fullWidth
        id="lname"
        label="Surname"
        name="lname"
        variant="outlined"
        margin="normal"
        value={formik.values.lname}
        onChange={formik.handleChange}
        error={formik.touched.lname && Boolean(formik.errors.lname)}
        helperText={formik.touched.lname && formik.errors.lname}
      />
      <TextField
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
      <TextField
        fullWidth
        id="confirm-password"
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        variant="outlined"
        margin="normal"
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
        autoComplete="confirm-password"
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={formik.isSubmitting}>
        Register
      </Button>
    </form>
  );
};
