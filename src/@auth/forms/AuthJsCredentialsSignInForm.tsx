import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { signIn } from 'next-auth/react';
import { Alert } from '@mui/material';

// Esquema de validação com Zod
const schema = z.object({
	login: z.string().min(1, 'Por favor, insira seu login.'),
	password: z.string().min(1, 'Por favor, insira sua senha.')
});

type FormType = {
	login: string;
	password: string;
};

const defaultValues: FormType = {
	login: '',
	password: ''
};

function AuthJsCredentialsSignInForm() {
	const [loading, setLoading] = useState(false);

	const { control, formState, handleSubmit, setError } = useForm<FormType>({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, errors } = formState;

	async function onSubmit(formData: FormType) {
		setLoading(true);
		const { password, login } = formData;

		const result = await signIn('credentials', {
			login,
			password,
			formType: 'signin',
			redirect: false
		});

		if (result?.error) {
			setError('root', { type: 'manual', message: 'Usuário não encontrado para os parâmetros fornecidos.' });
			setLoading(false);
			return false;
		}

		setLoading(false);
		return true;
	}

	return (
		<form
			name="loginForm"
			noValidate
			className="mt-32 flex w-full flex-col justify-center"
			onSubmit={handleSubmit(onSubmit)}
		>
			{errors?.root?.message && (
				<Alert
					className="mb-32"
					severity="error"
				>
					{errors.root.message}
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
				disabled={!isValid || loading}
			>
				{loading ? (
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
