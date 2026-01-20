const signinErrors: Record<string, string> = {
	default: 'Não foi possível fazer login.',
	Signin: 'Tente entrar com uma conta diferente.',
	OAuthSignin: 'Tente entrar com uma conta diferente.',
	OAuthCallbackError: 'Tente entrar com uma conta diferente.',
	OAuthCreateAccount: 'Tente entrar com uma conta diferente.',
	EmailCreateAccount: 'Tente entrar com uma conta diferente.',
	Callback: 'Tente entrar com uma conta diferente.',
	OAuthAccountNotLinked: 'Para confirmar sua identidade, entre com a mesma conta que usou originalmente.',
	EmailSignin: 'Não foi possível enviar o e-mail.',
	CredentialsSignin: 'Falha no login. Verifique se os dados fornecidos estão corretos.',
	SessionRequired: 'Por favor, faça login para acessar esta página.'
};

export default signinErrors;
