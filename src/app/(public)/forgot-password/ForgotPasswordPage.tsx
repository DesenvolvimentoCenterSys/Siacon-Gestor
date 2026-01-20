'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import CardContent from '@mui/material/CardContent';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Alert } from '@mui/material';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import useNavigate from '@fuse/hooks/useNavigate';
import {api} from '../../../services/api';


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

// Schema para etapa 1: e-mail e CPF
const step1Schema = z.object({
  email: z.string().email('Insira um e-mail válido').nonempty('O e-mail é obrigatório'),
  cpf: z
      .string()
      .nonempty('CPF é obrigatório')
      .refine((val) => validateCPF(val), { message: 'CPF inválido' })
});
type Step1Form = z.infer<typeof step1Schema>;

// Schema para etapa 3: nova senha e confirmação
const step3Schema = z
  .object({
    newPassword: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string().min(8, 'A confirmação deve ter no mínimo 8 caracteres')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
  });
type Step3Form = z.infer<typeof step3Schema>;

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [code, setCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Formulário da etapa 1
  const {
    control: controlStep1,
    handleSubmit: handleSubmitStep1,
    formState: { errors: errorsStep1 },
    getValues
  } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema)
  });

  // Formulário da etapa 3
  const {
    control: controlStep3,
    handleSubmit: handleSubmitStep3,
    formState: { errors: errorsStep3 }
  } = useForm<Step3Form>({
    resolver: zodResolver(step3Schema)
  });

  // Inicia o timer para o link de reenvio
  const startResendTimer = () => {
    setResendCooldown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Etapa 1: Envia e-mail e CPF para recuperar a conta
  async function onSubmitStep1(data: Step1Form) {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await api.post('/api/cliente/forgot', data, {
             headers: {
               Authorization: 'Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.YXViY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6YWIxMjM0NTY3ODkwMTIzNA'
             }
           });
      const clientData = response.data;
      if (clientData.codCliente) {
        setClient(clientData);
        setStep(2); // Avança para a etapa 2 para digitar o código
        startResendTimer();
      } else {
        setErrorMessage(response.data.message || 'Erro ao enviar e-mail de recuperação.');
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Erro ao enviar e-mail de recuperação.');
    }
    setLoading(false);
  }

  // Etapa 2: Validação do código recebido
  async function onSubmitStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!code || code.length !== 4) {
      setErrorMessage('O código deve ter 4 dígitos.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    const { email, cpf } = getValues() as Step1Form;
    try {
      const response = await api.post(
        '/api/cliente/recoverycode',
        { email, cpf, token: code },
        { headers: {  Authorization: 'Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.YXViY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6YWIxMjM0NTY3ODkwMTIzNA' } }
      );
      const clientData = response.data;
      if (clientData.codCliente) {
        setStep(3); // Avança para a etapa 3 para alterar a senha
      } else {
        setErrorMessage(response.data.message || 'Código inválido.');
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Erro ao validar código.');
    }
    setLoading(false);
  }

  // Etapa 3: Envio da nova senha
  async function onSubmitStep3(data: Step3Form) {
    setLoading(true);
    setErrorMessage('');
    const { email, cpf } = getValues() as Step1Form;
    try {
      const response = await api.post(
        '/api/cliente/recoverypassword',
        { email, cpf, newPassword: data.newPassword },
        { headers: {  Authorization: 'Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.YXViY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6YWIxMjM0NTY3ODkwMTIzNA' } }
      );
      const clientData = response.data;
      if (clientData.codCliente) {
        // Em caso de sucesso, redireciona para a tela de login
        navigate('/sign-in');
      } else {
        setErrorMessage(response.data.message || 'Erro ao atualizar a senha.');
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Erro ao atualizar a senha.');
    }
    setLoading(false);
  }

  // Função para reenvio do e-mail de recuperação (etapa 2)
  async function handleResend() {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMessage('');
    const values = getValues() as Step1Form;
    try {
      await api.post('/api/cliente/forgot', values, {
        headers: {  Authorization: 'Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.YXViY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6YWIxMjM0NTY3ODkwMTIzNA' }
      });
      startResendTimer();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Erro ao reenviar e-mail.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
    <div className="flex min-w-0 flex-1 flex-col items-center sm:flex-row sm:justify-center md:items-start md:justify-start">
       <Paper className="w-full max-w-md p-8 sm:rounded-xl sm:shadow-lg bg-white">
       <CardContent className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
					<img
						className="w-256"
						src="/assets/images/logo/bd.png"
						alt="logo"
					/>
      <h1>Recuperação de Senha</h1>
      {errorMessage && (
        <Alert severity="error" style={{ marginBottom: '16px' }} className='mt-8'>
          {errorMessage}
        </Alert>
      )}
      {step === 1 && (
        <form onSubmit={handleSubmitStep1(onSubmitStep1)}>
          <Controller
            name="email"
            control={controlStep1}
            render={({ field }) => (
              <TextField
                {...field}
                label="E-mail"
                type="email"
                fullWidth
                margin="normal"
                error={!!errorsStep1.email}
                helperText={errorsStep1.email?.message}
                required
              />
            )}
          />
          <Controller
            name="cpf"
            control={controlStep1}
            render={({ field }) => (
              <TextField
                {...field}
                label="CPF"
                type="text"
                fullWidth
                margin="normal"
                error={!!errorsStep1.cpf}
                helperText={errorsStep1.cpf?.message}
                required
              />
            )}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} className='mt-8'>
            {loading ? <CircularProgress size={24} /> : 'Recuperar'}
          </Button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={onSubmitStep2}>
          <Alert severity="info" style={{ marginBottom: '16px' }} className='mt-8'>
            Um e-mail com o código de validação foi enviado. Verifique seu e-mail.
          </Alert>
          <TextField
            label="Código de Validação (4 dígitos)"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setErrorMessage('');
            }}
            fullWidth
            margin="normal"
            required
          />
          <div style={{ marginBottom: '16px' }}>
            <Link
              onClick={handleResend}
              style={{
                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                opacity: resendCooldown > 0 ? 0.5 : 1
              }}
            >
              {resendCooldown > 0 ? `Reenviar e-mail (${resendCooldown})` : 'Reenviar e-mail'}
            </Link>
          </div>
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading || code.length !== 4}>
            {loading ? <CircularProgress size={24} /> : 'Validar Código'}
          </Button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handleSubmitStep3(onSubmitStep3)}>
          <Controller
            name="newPassword"
            control={controlStep3}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nova Senha"
                type="password"
                fullWidth
                margin="normal"
                error={!!errorsStep3.newPassword}
                helperText={errorsStep3.newPassword?.message}
                required
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={controlStep3}
            render={({ field }) => (
              <TextField
                {...field}
                label="Confirmar Nova Senha"
                type="password"
                fullWidth
                margin="normal"
                error={!!errorsStep3.confirmPassword}
                helperText={errorsStep3.confirmPassword?.message}
                required
              />
            )}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} className='mt-8'>
            {loading ? <CircularProgress size={24} /> : 'Atualizar Senha'}
          </Button>
        </form>
      )}
      </CardContent>
      </Paper>
    </div>
    </div>
    </div>
  );
}

export default ForgotPasswordPage;
