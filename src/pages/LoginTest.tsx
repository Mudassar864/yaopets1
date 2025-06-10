import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginTest() {
  const [email, setEmail] = useState('teste@yaopets.lat');
  const [password, setPassword] = useState('123456');
  const [loginResult, setLoginResult] = useState<any>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const { toast } = useToast();

  async function handleLogin() {
    try {
      // Limpar resultados anteriores
      setLoginResult(null);
      setDiagnosticInfo(null);

      // Fazer login
      console.log(`Tentando login com: ${email} / ${password}`);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para cookies
        body: JSON.stringify({ 
          email, 
          password,
          // O campo userType é obrigatório no schema
          userType: 'tutor' 
        }),
      });

      const data = await response.json();
      setLoginResult({ 
        success: response.ok, 
        status: response.status,
        data, 
        headers: { 'x-auth-status': response.headers.get('x-auth-status') }
      });

      if (response.ok) {
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo, ${data.name || data.email}!`,
        });
      } else {
        toast({
          title: "Falha no login",
          description: data.message || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setLoginResult({ success: false, error: String(error) });
      toast({
        title: "Erro",
        description: "Houve um problema ao tentar fazer login",
        variant: "destructive",
      });
    }
  }

  async function checkSession() {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Importante para cookies
      });

      const data = await response.json();
      setLoginResult({ 
        success: response.ok, 
        status: response.status,
        data 
      });

      if (response.ok) {
        toast({
          title: "Sessão ativa",
          description: `Logado como ${data.name || data.email}`,
        });
      } else {
        toast({
          title: "Sem sessão",
          description: "Não há usuário logado",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      setLoginResult({ success: false, error: String(error) });
    }
  }

  async function runDiagnostic() {
    try {
      const response = await fetch('/api/auth/diagnose', {
        credentials: 'include', // Importante para cookies
      });

      const data = await response.json();
      setDiagnosticInfo(data);
      
      toast({
        title: "Diagnóstico concluído",
        description: `SessionID: ${data.sessionID || 'nenhum'}`,
      });
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      setDiagnosticInfo({ error: String(error) });
      toast({
        title: "Erro no diagnóstico",
        description: String(error),
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Login</CardTitle>
          <CardDescription>
            Ferramenta de diagnóstico para problemas de autenticação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="usuario@exemplo.com" 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Senha</label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="********" 
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 items-start">
          <div className="flex gap-2 w-full justify-start">
            <Button onClick={handleLogin}>Login</Button>
            <Button variant="outline" onClick={checkSession}>Verificar Sessão</Button>
            <Button variant="secondary" onClick={runDiagnostic}>Diagnóstico</Button>
          </div>
          
          {loginResult && (
            <div className="w-full mt-4">
              <h3 className="font-semibold mb-2">Resultado:</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(loginResult, null, 2)}
              </pre>
            </div>
          )}
          
          {diagnosticInfo && (
            <div className="w-full mt-4">
              <h3 className="font-semibold mb-2">Diagnóstico:</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(diagnosticInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}