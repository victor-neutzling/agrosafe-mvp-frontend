import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '@/services/auth'
import { useAppStore } from '@/store/appStore'

const schema = z.object({ email: z.string().email('E-mail inválido'), password: z.string().min(4, 'Senha inválida'), remember: z.boolean().optional() })

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate(); const setAuth = useAppStore((s) => s.setAuth)
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { email:'ana@granja.com', password:'1234' } })
  const onSubmit = async (data: FormData) => { try { const res = await authService.login(data.email, data.password); setAuth(res.token, res.user); navigate('/dashboard') } catch { setError('root', { message: 'Falha na autenticação' }) } }
  return <div className="flex min-h-screen items-center justify-center bg-slate-100"><form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-md"><h1 className="text-xl font-bold">Controle de Acesso - Granjas</h1><p className="mb-4 text-sm text-slate-500">Acesse com suas credenciais.</p><input className="input" placeholder="E-mail" {...register('email')} /><p className="text-xs text-red-500">{errors.email?.message}</p><input className="input mt-2" type="password" placeholder="Senha" {...register('password')} /><p className="text-xs text-red-500">{errors.password?.message}</p><label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" {...register('remember')}/>Lembrar acesso</label>{errors.root && <p className="mt-2 text-sm text-red-500">{errors.root.message}</p>}<button className="btn-primary mt-4 w-full">Entrar</button></form></div>
}
