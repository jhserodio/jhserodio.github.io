# Troubleshooting SSL - serodio.dev

## Problema atual
- ❌ Certificado SSL não válido para serodio.dev
- ❌ Não consegue habilitar "Enforce HTTPS"
- ❌ Firefox bloqueando por HSTS

## Solução passo a passo

### 1. Verificar DNS na GoDaddy

Acesse: https://dcc.godaddy.com/control/serodio.dev/dns

Confirme se os registros DNS estão **EXATAMENTE** assim:

```
Type: A     | Name: @   | Value: 185.199.108.153 | TTL: 600
Type: A     | Name: @   | Value: 185.199.109.153 | TTL: 600
Type: A     | Name: @   | Value: 185.199.110.153 | TTL: 600
Type: A     | Name: @   | Value: 185.199.111.153 | TTL: 600
Type: CNAME | Name: www | Value: jhserodio.github.io | TTL: 600
```

⚠️ **IMPORTANTE**: 
- Remova QUALQUER outro registro A ou CNAME para @ e www
- Certifique-se que não há redirect ou proxy ativo

### 2. Verificar propagação DNS online

- [ ] Acessar: https://dnschecker.org/#A/serodio.dev
- [ ] Confirmar que os 4 IPs do GitHub aparecem globalmente
- [ ] Acessar: https://dnschecker.org/#CNAME/www.serodio.dev
- [ ] Confirmar que aponta para jhserodio.github.io

**Se não estiver propagado**: aguarde 15-30 minutos e tente novamente

### 3. Remover e re-adicionar Custom Domain no GitHub

- [ ] Ir em: https://github.com/jhserodio/jhserodio.github.io/settings/pages
- [ ] Em "Custom domain", clicar em **Remove**
- [ ] Clicar em **Save**
- [ ] Aguardar 2 minutos
- [ ] Adicionar novamente: `serodio.dev`
- [ ] Clicar em **Save**
- [ ] **IMPORTANTE**: Aguardar aparecer ✅ "DNS check successful"

### 4. Aguardar provisionamento do certificado SSL

Após DNS check successful:

- [ ] Aguardar 5-10 minutos
- [ ] A opção "Enforce HTTPS" aparecerá (inicialmente desabilitada)
- [ ] Aguardar mais 5-15 minutos até ficar habilitada
- [ ] Marcar **Enforce HTTPS**

⏰ **Tempo total estimado**: 10-30 minutos após DNS propagado

### 5. Limpar HSTS do Firefox

Enquanto aguarda o SSL, limpe o HSTS do navegador:

**Firefox:**
1. Abrir nova aba
2. Digitar na barra de endereço: `about:preferences#privacy`
3. Rolar até "Cookies e dados de sites"
4. Clicar em "Gerenciar dados..."
5. Buscar por: `serodio.dev`
6. Clicar em "Remover selecionados"
7. Clicar em "Salvar alterações"
8. Fechar e reabrir o Firefox

**Alternativa - Limpar tudo:**
1. `about:preferences#privacy`
2. "Limpar dados..."
3. Marcar "Cookies e dados de sites"
4. Marcar "Conteúdo web em cache"
5. Clicar em "Limpar"

### 6. Teste após configuração

Depois que "Enforce HTTPS" estiver ativo:

- [ ] Limpar cache do navegador (Ctrl+Shift+Del)
- [ ] Tentar acessar: `http://serodio.dev` (deve redirecionar para https)
- [ ] Tentar acessar: `https://serodio.dev` (deve funcionar)
- [ ] Tentar acessar: `https://www.serodio.dev` (deve funcionar)
- [ ] Verificar cadeado verde no navegador
- [ ] Clicar no cadeado → Ver certificado → Confirmar que é válido para serodio.dev

## Comandos úteis para verificação

### Verificar DNS (após instalar bind-tools):
```bash
# Instalar ferramentas DNS
sudo dnf install bind-utils  # ou apt install dnsutils

# Verificar registros A
dig serodio.dev A +short

# Verificar CNAME www
dig www.serodio.dev CNAME +short
```

### Verificar SSL do site:
```bash
# Verificar certificado SSL
echo | openssl s_client -servername serodio.dev -connect serodio.dev:443 2>/dev/null | openssl x509 -noout -dates -subject
```

### Via browser (console):
```javascript
// Abrir console do navegador (F12) e colar:
fetch('https://serodio.dev')
  .then(() => console.log('SSL OK'))
  .catch(e => console.error('SSL Error:', e))
```

## Checklist completo

- [ ] DNS configurado corretamente na GoDaddy (4 registros A + 1 CNAME)
- [ ] DNS propagado globalmente (verificar em dnschecker.org)
- [ ] Custom domain removido e re-adicionado no GitHub
- [ ] "DNS check successful" apareceu no GitHub Pages
- [ ] Aguardou 10-30 minutos após DNS check
- [ ] "Enforce HTTPS" ficou disponível e foi marcado
- [ ] HSTS limpo do Firefox
- [ ] Cache do navegador limpo
- [ ] Site acessível via https://serodio.dev
- [ ] Certificado SSL válido para serodio.dev

## Problemas comuns

### "Enforce HTTPS" não aparece
- ✅ Confirmar que DNS está correto
- ✅ Aguardar mais 30 minutos
- ✅ Remover e adicionar custom domain novamente

### DNS check falha
- ✅ Verificar se há outros registros conflitantes na GoDaddy
- ✅ Desativar proxy/redirect se houver
- ✅ Aguardar propagação (pode levar até 48h)

### Certificado ainda é do GitHub
- ✅ O GitHub ainda não provisionou o SSL
- ✅ Aguardar mais tempo (até 24h em casos raros)
- ✅ Verificar se "Enforce HTTPS" está desmarcado enquanto provisiona

### HSTS persiste mesmo depois de limpar
- ✅ Usar modo anônimo/privado
- ✅ Usar outro navegador
- ✅ Aguardar o SSL ser provisionado corretamente

## Timeline esperado

```
0min   → Configurar DNS na GoDaddy
15min  → DNS começa a propagar
30min  → DNS totalmente propagado
35min  → Adicionar custom domain no GitHub
36min  → DNS check successful
40min  → Opção "Enforce HTTPS" aparece
50min  → Certificado SSL provisionado
51min  → Marcar "Enforce HTTPS"
55min  → Site funcionando com HTTPS ✅
```

## Status atual

Data/Hora: _________________

- [ ] DNS configurado
- [ ] DNS propagado
- [ ] Custom domain adicionado
- [ ] DNS check passou
- [ ] Aguardando SSL
- [ ] SSL provisionado
- [ ] HTTPS funcionando

## Notas

O erro `SSL_ERROR_BAD_CERT_DOMAIN` é **NORMAL** enquanto o GitHub não provisiona o certificado SSL. Isso acontece porque:

1. O site ainda está servindo o certificado padrão do *.github.io
2. Você tentou acessar via HTTPS antes do SSL estar pronto
3. O HSTS forçou a conexão HTTPS

**Solução**: Aguardar o provisionamento do SSL pelo GitHub (steps 3-4 acima)
