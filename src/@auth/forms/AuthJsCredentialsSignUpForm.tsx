import React from 'react';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import _ from 'lodash';
import Swal from 'sweetalert2';
import useNavigate from '@fuse/hooks/useNavigate';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import { Alert, CircularProgress } from '@mui/material';
import InputMask from 'react-input-mask';
import {api} from '../../services/api';

// Tipos para os dados do cliente
interface Convenio {
  codConvenio: number
  codControle: number
  cNome: string
  dDataAtualizacao: string
  cUsuarioAtualizacao: string
  nPercParticipacaoMensalidade: number
  codOrganizacao: number
  cObservacao: string | null
  nDiaVencMens: number
  nDiaVencUtiliz: number
  codBanco: number | null
  nIdFormaPagamento: number
  nIdPadrao: number
  nIdBaseCalculo: number
  nIdClassificacao: number
  codFolhaPagamento: number | null
  nIdContratoObrigatorio: number
  nIdDataValidadeObrigatorio: number
  nIdIdentificaAssociado: number
  nIdInativo: number
  nIdGerarMatriculaAutomatica: number
  nIdFornecedorObrigatorio: number
}

interface ConvenioCliente {
  codConvenioCliente: number
  codControle: number
  dDataInicioVigencia: string
  dDataFimVigencia: string | null
  cNumCarteira: string
  dDataAtualizacao: string
  cUsuarioAtualizacao: string
  codCliente: number
  codConvenio: number
  nIdTaxa: number
  nIdRepasseINSS: number
  dDataValidadeCarteira: string | null
  codContrato: number | null
  codProponente: number
  nIdResponsavelCobranca: number
  codFornecedor: number | null
  nIdPermissaoPortalVendas: number | null
  convenio: Convenio
  ativo: number
}

interface Cliente {
  message: string
  codCliente: number
  codControle: number
  cNome: string
  codClienteCobr: number | null
  dDataNasc: string
  dDataInicioVigencia: string
  cNumCPF: string
  cNumRG: string | null
  cNomeMae: string | null
  cNomePai: string | null
  codParentesco: number | null
  cEndereco: string
  cBairro: string
  cNumCep: string
  codCidade: number
  cFone: string | null
  cFoneCelular: string | null
  cEmail: string
  cObservacao: string
  cNumSUS: string | null
  dDataFimVigencia: string | null
  dDataAtualizacao: string
  cUsuarioAtualizacao: string
  cSexo: string
  cLstEstadoCivil: string
  cLstTipoCliente: string
  codProponente: number
  cLstCodEntidade: string
  codIntegracao: number | null
  codSetor: number | null
  cFoneCelular1: string | null
  cEnviarEmail: string
  codEmpresa: number
  cEmailEventos: string | null
  codBanco: number | null
  nIdFormaPagamento: number | null
  nDiaVencMens: number | null
  nDiaVencUtiliz: number | null
  cNomeFantasia: string | null
  cNumInscricaoEstadual: string | null
  dDataFiliacao: string
  codFolhaPagamento: number | null
  cNomePopular: string | null
  nQtdeFuncionario: number | null
  dDataBloqueio: string | null
  cSenhaClubeDescontos: string | null
  cTokenClubeDescontos: string | null
  convenioClientes: ConvenioCliente[]
  cobrancas: any[]
}

function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  let remainder;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;

  return true;
}

const cpfSchema = z.object({
  cpf: z
    .string()
    .nonempty('CPF é obrigatório')
    .refine((val) => validateCPF(val), { message: 'CPF inválido' })
});


const schema = z
  .object({
    displayName: z.string().nonempty('Você deve inserir seu nome'),
    email: z
      .string()
      .email('Você deve inserir um e-mail válido')
      .nonempty('O e-mail é obrigatório'),
			phone: z
			.string()
			.optional()
			.transform((val) => val?.replace(/\D/g, "") || "")
			.refine((val) => val === "" || /^\d{11}$/.test(val), {
				message: "Telefone inválido",
    }),
    password: z
      .string()
      .nonempty('Por favor, insira sua senha.')
      .min(8, 'A senha é muito curta - deve ter no mínimo 8 caracteres.'),
    passwordConfirm: z.string().nonempty('A confirmação da senha é obrigatória'),
    acceptTermsConditions: z
      .boolean()
      .refine((val) => val === true, 'Você deve aceitar os termos e condições.')
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'As senhas devem ser iguais',
    path: ['passwordConfirm']
  });

export type FormType = {
  displayName: string;
  password: string;
  email: string;
	phone: string;
};

export type SignUpFormData = FormType & {
  passwordConfirm: string;
  acceptTermsConditions: boolean;
};

const defaultValues: SignUpFormData = {
  displayName: '',
  email: '',
  password: '',
  passwordConfirm: '',
	phone: '',
  acceptTermsConditions: false
};

function AuthJsCredentialsSignUpForm() {
  const [cpfValidated, setCpfValidated] = React.useState(false);
	const [isAssociateLoading, setIsAssociateLoading] = React.useState(false); 
  const [cliente, setCliente] = React.useState<Cliente>({} as Cliente); 
  const [errorMessage, setErrorMessage] = React.useState('');
  const navigate = useNavigate();
  const crypto = require('crypto');

function encryptMD5(password) {
    const key = 'Center@Sys';
    const hash = crypto.createHash('md5').update(password + key).digest('hex');
    return hash;
}

 async function handleAssociateCodeBlur(value: string) {
  setErrorMessage('');
  setIsAssociateLoading(true);

  if (value) {
    const cleanedValue = value.replace(/\D/g, '');
    let params;

    if (cleanedValue.length === 11) {
      const formattedCpf = cleanedValue;
      params = { cpf: formattedCpf };
    } else {
      params = { numCarteira: value };
    }

    try {
      const response = await api.get<Cliente>('/api/cliente', { params });
      if (response.data?.cSenhaClubeDescontos?.length > 0 &&
        (!response.data?.cTokenClubeDescontos ||
        response.data?.cTokenClubeDescontos?.length === 0))
      {
        setErrorMessage('CPF já cadastrado'); 
        setCliente({} as Cliente);
        return 
      }
      if (response.data?.message === 'Cliente não encontrado.' ) 
      {
        setErrorMessage('CPF não encontrado'); 
        setCliente({} as Cliente); 
        return
      } 
        setCliente(response.data); 
    } catch (error) {
      setErrorMessage('CPF não encontrado');
      setCliente({} as Cliente); 
    } finally {
      setIsAssociateLoading(false);
    }
  } else {
    setCliente({} as Cliente);
    setIsAssociateLoading(false);
  }
}

  const {
    control: cpfControl,
    handleSubmit: handleCpfSubmit,
    formState: { errors: cpfErrors, isValid: cpfIsValid }
  } = useForm<{ cpf: string }>({
    defaultValues: { cpf: '' },
    resolver: zodResolver(cpfSchema),
    mode: 'onChange'
  });

  const onCpfSubmit = (data: { cpf: string }) => {
		const cleanedCpf = data.cpf.replace(/\D/g, '');
		
		if (cleanedCpf.length === 11 && validateCPF(cleanedCpf)) {
			setCpfValidated(true);
			handleAssociateCodeBlur(data.cpf); 
		} else {
			setCpfValidated(false);
		}
	};

  const { control, formState, handleSubmit, setError, setValue  } = useForm<SignUpFormData>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema)
  });

	useEffect(() => {
		if (cliente) {
			setValue("displayName", cliente.cNome ?? "");
			setValue("email", cliente.cEmail ?? "");
			setValue("phone", cliente.cFone ?? "");
		}
	}, [cliente, setValue]);

  const { isValid, dirtyFields, errors } = formState;

  async function onSubmit(formData: SignUpFormData) {
    try {
      setIsAssociateLoading(true);
      const { displayName, email, password, phone } = formData;
      cliente.cNome = displayName;
      cliente.cEmail = email;
      cliente.cSenhaClubeDescontos = encryptMD5(password);
      cliente.cFone = phone;
      const response = await api.put('/api/cliente/signup', cliente, {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.YXViY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6YWIxMjM0NTY3ODkwMTIzNA'
        }
      });
      Swal.fire({
        title: "Cadastro realizado! Verifique seu e-mail para ver o código de ativação e concluir o processo. Verifique sua caixa de span/lixo eletrônico",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        }
      });
    } catch (error) {
      setError('root', { type: 'manual', message: 'Erro ao cadastrar usuário' });
      setIsAssociateLoading(false);
      return false;
    }
    setIsAssociateLoading(false);
    navigate('/sign-in');
  }
  
  return (
    <>
      {!cpfValidated || !cliente?.cNumCPF ? (
        <form
          onSubmit={handleCpfSubmit(onCpfSubmit)}
          className="mt-32 flex w-full flex-col justify-center"
          noValidate
        >
         <Controller
  name="cpf"
  control={cpfControl}
  render={({ field, fieldState }) => (
    <InputMask
      mask="999.999.999-99"
      {...field}
      onBlur={(e) => {
        field.onBlur();
        const cleanedCpf = e.target.value.replace(/\D/g, '');
        if (cleanedCpf.length === 11 && !validateCPF(cleanedCpf)) {
          cpfControl.setError('cpf', { type: 'manual', message: 'CPF inválido' });
        } else if (cleanedCpf.length < 11) {
					cpfControl.setError('cpf', { type: 'manual', message: 'CPF incompleto' });
        }
      }}
    >
      {(inputProps: any) => (
        <TextField
          {...inputProps}
          label="CPF"
          error={Boolean(fieldState.error && field.value.replace(/\D/g, '').length === 11)}
          helperText={
            field.value.replace(/\D/g, '').length === 11 ? fieldState.error?.message : ''
          }
          variant="outlined"
          required
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCpfSubmit(onCpfSubmit)();
            }
          }}
        />
      )}
    </InputMask>
  )}
/>

          <Button
            variant="contained"
            color="secondary"
            className="my-24 w-full"
            aria-label="Buscar"
            type="submit"
            size="large"
            disabled={!cpfIsValid || isAssociateLoading}
						startIcon={isAssociateLoading ? <CircularProgress size={24} color="inherit" /> : null}
          >
            Buscar
          </Button>
					{errorMessage && (
          <Alert className="mt-4" severity="error">
            {errorMessage}
          </Alert>
        )}
        </form>
      ) : (
        <form
          name="registerForm"
          noValidate
          className="mt-32 flex w-full flex-col justify-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          {errors?.root?.message && (
            <Alert
              className="mb-32"
              severity="error"
              sx={(theme) => ({
                backgroundColor: theme.palette.error.light,
                color: theme.palette.error.dark
              })}
            >
              {errors?.root?.message}
            </Alert>
          )}
          <Controller
  name="displayName"
  control={control}
  render={({ field }) => (
    <TextField
      {...field}
      className="mb-24"
      label="Nome"
      autoFocus
      type="text"
      error={!!errors.displayName}
      helperText={errors?.displayName?.message}
      variant="outlined"
      required
      fullWidth
    />
  )}
/>

<Controller
  name="email"
  control={control}
  render={({ field }) => (
    <TextField
      {...field}
      className="mb-24"
      label="E-mail"
      type="email"
      error={!!errors.email}
      helperText={errors?.email?.message}
      variant="outlined"
      required
      fullWidth
    />
  )}
/>

<Controller
  name="phone"
  control={control}
  render={({ field }) => (
    <InputMask
      mask="(99) 99999-9999"
      {...field}
      onBlur={(e) => {
        field.onBlur();
        const cleanedPhone = e.target.value.replace(/\D/g, ""); 
        if (cleanedPhone.length !== 11) {
          setValue("phone", "");
        }
      }}
    >
      {(inputProps) => (
        <TextField
          {...inputProps}
					 className="mb-24"
          label="Telefone WhatsApp"
          type="tel"
          error={!!errors.phone}
          helperText={errors.phone?.message}
          variant="outlined"
          fullWidth
        />
      )}
    </InputMask>
  )}
/>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                className="mb-24"
                label="Senha"
                type="password"
                error={!!errors.password}
                helperText={errors?.password?.message}
                variant="outlined"
                required
                fullWidth
              />
            )}
          />
          <Controller
            name="passwordConfirm"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                className="mb-24"
                label="Confirme a senha"
                type="password"
                error={!!errors.passwordConfirm}
                helperText={errors?.passwordConfirm?.message}
                variant="outlined"
                required
                fullWidth
              />
            )}
          />
         <Controller
  name="acceptTermsConditions"
  control={control}
  render={({ field }) => (
    <FormControl error={!!errors.acceptTermsConditions}>
      <FormControlLabel
        label={
          <>
            Eu concordo com os{' '}
            <a
              href="/assets/pdf/termo.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "blue", fontWeight: "bold", textDecoration: "none" }}
            >
              Termos e a Política de Privacidade
            </a>.
          </>
        }
        control={<Checkbox size="small" {...field} />}
      />
      <FormHelperText>{errors?.acceptTermsConditions?.message}</FormHelperText>
    </FormControl>
  )}
/>
<Button
  variant="contained"
  color="secondary"
  className="mt-24 w-full"
  aria-label="Criar conta"
  disabled={_.isEmpty(dirtyFields) || !isValid || isAssociateLoading}
  type="submit"
  size="large"
  startIcon={isAssociateLoading ? <CircularProgress size={24} color="inherit" /> : null}
>
  Criar conta
</Button>
        </form>
      )}
    </>
  );
}

export default AuthJsCredentialsSignUpForm;
