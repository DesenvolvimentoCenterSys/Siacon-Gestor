'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useAuth } from '@auth/useAuth';

// Esquema de validação com Zod
const schema = z.object({
	login: z.string().min(1, 'Por favor, insira seu login.'),
	password: z.string().min(1, 'Por favor, insira sua senha.')
});

type FormType = z.infer<typeof schema>;

const defaultValues: FormType = {
	login: '',
	password: ''
};

function AuthJsCredentialsSignInForm() {
	const { loginMutation } = useAuth();

	const { control, formState, handleSubmit } = useForm<FormType>({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, errors } = formState;

	function onSubmit(formData: FormType) {
		loginMutation.mutate({ login: formData.login, password: formData.password });
	}

	return (
		<form
			name="loginForm"
			noValidate
			className="mt-32 flex w-full flex-col justify-center"
			onSubmit={handleSubmit(onSubmit)}
		>
			{loginMutation.isError && (
				<Alert
					className="mb-32"
					severity="error"
				>
					{loginMutation.error.message}
				</Alert>
			)}

			<Controller
				name="login"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						inputRef={field.ref}
						className="mb-24"
						label="Login"
						autoFocus
						error={!!errors.login}
						helperText={errors.login?.message}
						variant="outlined"
						required
						fullWidth
					/>
				)}
			/>

			<Controller
				name="password"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						inputRef={field.ref}
						className="mb-24"
						label="Senha"
						type="password"
						error={!!errors.password}
						helperText={errors.password?.message}
						variant="outlined"
						required
						fullWidth
					/>
				)}
			/>

			<Button
				variant="contained"
				color="secondary"
				className="mt-16 w-full"
				aria-label="Entrar"
				type="submit"
				size="large"
				disabled={!isValid || loginMutation.isPending}
			>
				{loginMutation.isPending ? (
					<CircularProgress
						size={24}
						color="inherit"
					/>
				) : (
					'Entrar'
				)}
			</Button>
		</form>
	);
}

export default AuthJsCredentialsSignInForm;
