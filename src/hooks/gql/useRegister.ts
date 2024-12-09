import { useNavigate } from 'react-router-dom';
import { useMutation, ApolloError } from '@apollo/client';
import { EVENTS } from '~/constants';
import { REGISTER_AND_LOGIN_MUTATION } from '~/graphql';
import { useUserContext } from '~/state';
import { RegisterData } from '~/types';

interface RegisterUser {
  email: string;
  password: string;
  firstName: string;
  surname: string;
}

interface UseRegisterProps {
  onError: (error: ApolloError) => void;
}

export const useRegister = ({ onError }: UseRegisterProps) => {
  const navigate = useNavigate();
  const { dispatch } = useUserContext();

  const [registerAndLogin, { loading }] = useMutation<RegisterData>(REGISTER_AND_LOGIN_MUTATION, {
    onCompleted: data => {
      if (data) {
        const {
          registerAndLogin: { user, token }
        } = data;

        if (user && token) {
          localStorage.setItem('token', token);
          dispatch({ type: EVENTS.LOGIN, data: user });
          navigate('/setup');
        }
      }
    },
    onError
  });

  const register = (user: RegisterUser) => {
    registerAndLogin({
      variables: { user }
    });
  };

  return { register, loading };
};
