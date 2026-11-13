# Deploy no GitHub Pages com HTTPS

## Passo a passo para publicar seu site

### 1. Preparar o repositório local

- [ ] Verificar se todas as alterações estão salvas
- [ ] Adicionar os arquivos ao git:
```bash
git add .
```
- [ ] Fazer commit das alterações:
```bash
git commit -m "Atualizar GitHub Actions para v4 e conteúdo do site"
```

### 2. Fazer push para o GitHub

- [ ] Fazer push das alterações:
```bash
git push origin master
```

### 3. Configurar GitHub Pages no repositório

- [ ] Acessar seu repositório no GitHub: `https://github.com/jhserodio/jhserodio.github.io`
- [ ] Ir em **Settings** (Configurações)
- [ ] No menu lateral, clicar em **Pages**
- [ ] Em **Source**, selecionar:
  - **Source**: GitHub Actions (não Branch)
  
### 4. Verificar o deploy

- [ ] Ir na aba **Actions** do repositório
- [ ] Verificar se o workflow "Deploy to GitHub Pages" está rodando
- [ ] Aguardar o build e deploy finalizarem (ícone verde ✓)
- [ ] Clicar no workflow para ver os detalhes e verificar se não há erros

### 5. Configurar DNS na GoDaddy

- [ ] Fazer login na GoDaddy: `https://www.godaddy.com`
- [ ] Ir em **My Products** → **Domains**
- [ ] Clicar em **DNS** ao lado do seu domínio
- [ ] Adicionar/Atualizar os seguintes registros:

#### Registros DNS necessários:

**Para domínio raiz (jhserodio.github.io ou seu domínio customizado):**

- [ ] Adicionar registro **A** apontando para os IPs do GitHub Pages:
```
Type: A
Name: @
Value: 185.199.108.153
TTL: 600
```

- [ ] Adicionar mais 3 registros **A**:
```
Type: A, Name: @, Value: 185.199.109.153
Type: A, Name: @, Value: 185.199.110.153
Type: A, Name: @, Value: 185.199.111.153
```

**Para www:**

- [ ] Adicionar registro **CNAME**:
```
Type: CNAME
Name: www
Value: jhserodio.github.io
TTL: 600
```

### 6. Configurar Custom Domain no GitHub

- [ ] Voltar em **Settings** → **Pages** no GitHub
- [ ] Em **Custom domain**, digitar: `serodio.dev`
- [ ] Clicar em **Save**
- [ ] Aguardar a validação DNS (pode levar alguns minutos)

### 7. Ativar HTTPS

- [ ] Ainda em **Settings** → **Pages**
- [ ] Aguardar aparecer a opção **Enforce HTTPS** (pode levar até 24h após configurar o DNS)
- [ ] Marcar a checkbox **Enforce HTTPS**
- [ ] O GitHub irá provisionar automaticamente um certificado SSL via Let's Encrypt

### 8. Adicionar arquivo CNAME ao projeto

- [ ] Criar arquivo `CNAME` em `/public/CNAME` com o conteúdo:
```
serodio.dev
```
- [ ] Fazer commit e push:
```bash
git add public/CNAME
git commit -m "Adicionar CNAME para domínio customizado"
git push origin master
```

### 9. Verificação final

- [ ] Aguardar propagação DNS (15min a 48h, geralmente 1-2h)
- [ ] Testar acesso via HTTP: `http://serodio.dev`
- [ ] Testar acesso via HTTPS: `https://serodio.dev`
- [ ] Testar www: `https://www.serodio.dev`
- [ ] Verificar certificado SSL (cadeado verde no navegador)

## Comandos úteis para debug

### Verificar propagação DNS:
```bash
# Linux/Mac
dig serodio.dev
dig www.serodio.dev

# Ou usar online
https://dnschecker.org
```

### Ver logs do GitHub Actions:
- Acessar: `https://github.com/jhserodio/jhserodio.github.io/actions`

## Troubleshooting

### Se o deploy falhar:
- Verificar logs na aba Actions
- Conferir se o arquivo `.github/workflows/deploy.yml` está correto
- Verificar se as permissões do repositório permitem GitHub Actions

### Se o HTTPS não ativar:
- Aguardar até 24h após configurar DNS
- Verificar se DNS está propagado corretamente
- Remover e adicionar novamente o custom domain no GitHub
- Verificar se todos os 4 registros A estão corretos

### Se o site não carregar:
- Verificar em `astro.config.mjs` se o `site` está correto
- Limpar cache do navegador
- Testar em modo anônimo/privado

## Observações importantes

⚠️ **Tempo de propagação DNS**: Pode levar de 15 minutos a 48 horas
⚠️ **HTTPS**: Só fica disponível após DNS propagar completamente
⚠️ **Cache**: Pode ser necessário limpar cache do navegador para ver alterações
✅ **Automatização**: Após configurado, todo push na branch master fará deploy automático
