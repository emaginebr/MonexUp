# Integração MonexUp com Dedalo API

> Documenta os gaps, convenções de mapeamento e alterações necessárias no projeto Dedalo para suportar o sistema de templates do MonexUp.

**Created:** 2026-03-30
**Last Updated:** 2026-03-30

---

## Contexto

O MonexUp migrou seu sistema de templates para o projeto Dedalo (CMS separado). O frontend do MonexUp agora consome a API do Dedalo em vez de ter um backend próprio para templates. Este documento descreve o que precisa ser implementado ou alterado no Dedalo para suportar todas as funcionalidades.

---

## Configuração

### Variável de Ambiente

O frontend do MonexUp precisa da variável:

```
REACT_APP_DEDALO_API_URL=http://localhost:5002
```

### Header de Tenant

Todas as requisições do MonexUp para o Dedalo incluem automaticamente:

```
X-Tenant-Id: monexup
```

O Dedalo precisa ter o tenant `monexup` configurado em `appsettings.json`:

```json
{
  "Tenants": {
    "monexup": {
      "ConnectionString": "Host=...;Port=5432;Database=monexup_dedalo_db;...",
      "JwtSecret": "<mesmo JWT secret do NAuth do MonexUp>",
      "BucketName": "monexup"
    }
  }
}
```

---

## Mapeamento de Conceitos

O MonexUp usa os seguintes conceitos de template que são mapeados para entidades do Dedalo:

| MonexUp (antigo)   | Dedalo (novo)                                      |
|--------------------|-----------------------------------------------------|
| Template           | Website                                              |
| TemplatePage       | Page                                                 |
| TemplatePart       | Content com `contentSlug = "parts"`                  |
| TemplateVar        | Content com `contentSlug = <varKey>`                 |

### Parts (Componentes de Layout)

Cada "part" é armazenado como um Content no Dedalo com:

- `contentSlug`: `"parts"`
- `contentType`: tipo do componente (ex: `"hero01"`, `"plan-3-cols"`, `"team-3-cols"`)
- `index`: ordem de exibição na página
- `contentValue`: `""` (vazio, pois a renderização é feita no frontend)

### Variables (Variáveis de Texto)

Cada variável é armazenada como múltiplos Content items agrupados por `contentSlug`:

- `contentSlug`: chave da variável (ex: `"hero-title"`, `"hero-subtitle"`)
- `contentType`: código do idioma (`"en"`, `"fr"`, `"es"`, `"pt"`)
- `index`: 0-3 (um por idioma)
- `contentValue`: texto traduzido

---

## Gaps e Alterações Necessárias no Dedalo

### 1. Suporte Multi-idioma para Variáveis

**Status:** Parcialmente suportado via convenção

O MonexUp usa 4 idiomas (English, French, Spanish, Portuguese) para cada variável de texto. Atualmente, isso é mapeado usando `contentType` como código de idioma. Funciona, mas o Dedalo não tem awareness nativo de idiomas.

**Recomendação:** Considerar adicionar um campo `language` ao Content model do Dedalo para tornar explícito, ou manter a convenção de usar `contentType` como identificador de idioma para variáveis.

### 2. Criação Automática de Website/Pages para Networks

**Status:** Não implementado

Quando o MonexUp cria uma nova Network, precisa automaticamente:

1. Criar um **Website** no Dedalo com `websiteSlug = networkSlug`
2. Criar **3 páginas padrão**:
   - `network-home` (página principal da network)
   - `network-seller` (página do vendedor na network)
   - `network-product` (página do produto na network)
3. Criar **content padrão** para cada página:
   - `network-home`: parts hero01, plan-3-cols, team-3-cols
   - `network-seller`: parts profile01, plan-3-cols, product-list-with-3-cols
   - `network-product`: parts product01
4. Criar **variáveis de texto padrão** em 4 idiomas para cada parte

**Opções de implementação:**
- **Opção A:** Endpoint no Dedalo que cria um website com template pré-definido (ex: `POST /website/from-template/{templateSlug}`)
- **Opção B:** O MonexUp backend chama múltiplos endpoints do Dedalo na criação da network
- **Opção C:** Seed manual via script SQL

### 3. Criação Automática de Website/Pages para Users (Sellers)

**Status:** Não implementado

Similar ao item anterior, mas para sellers individuais:

1. Criar um **Website** com `websiteSlug = userSlug`
2. Criar página `seller` com parts: profile01, product-list-with-3-cols

### 4. Reordenação de Parts (Move Up/Down)

**Status:** Suportado via content/area

O MonexUp usa o endpoint `PUT /website/{id}/page/{id}/content/area` para reordenar parts. O frontend envia todos os parts com `index` recalculado. Funciona com a API atual do Dedalo.

### 5. Upload de Imagens para Templates

**Status:** Suportado

O Dedalo já tem `POST /image/upload` para upload de arquivos. O frontend do MonexUp pode usar esse endpoint para upload de imagens em templates.

---

## Tipos de Parts (WebParts) Suportados

O frontend do MonexUp renderiza os seguintes tipos de componentes:

| partKey (contentType)         | Descrição                           |
|-------------------------------|-------------------------------------|
| `hero01`                      | Hero section estilo 1               |
| `hero02`                      | Hero section estilo 2               |
| `profile01`                   | Perfil do vendedor                  |
| `plan-3-cols`                 | Planos em 3 colunas                 |
| `plan-4-cols`                 | Planos em 4 colunas                 |
| `product-list-with-3-cols`    | Lista de produtos em 3 colunas      |
| `team-3-cols`                 | Time/equipe em 3 colunas            |
| `product01`                   | Detalhe do produto estilo 1         |

---

## Variáveis de Texto Padrão por Página

### network-home

Variáveis iniciais (cada uma com 4 idiomas):

- `hero-title`: Título principal
- `hero-subtitle`: Subtítulo
- `hero-btn`: Texto do botão CTA
- `plan-title`: Título da seção de planos
- `plan-subtitle`: Subtítulo dos planos
- `team-title`: Título da seção de equipe
- `team-subtitle`: Subtítulo da equipe

### network-seller

- `profile-title`: Título do perfil
- `plan-title`: Título dos planos
- `product-title`: Título da lista de produtos

### network-product

- `product-title`: Título do produto
- `product-btn`: Texto do botão de compra

---

## Endpoints Dedalo Utilizados pelo MonexUp

### Públicos (sem autenticação)

| Método | Endpoint                                    | Uso                              |
|--------|----------------------------------------------|----------------------------------|
| GET    | `/page/{pageSlug}?websiteSlug={slug}`        | Carregar página de network       |

### Autenticados (Bearer token + X-Tenant-Id)

| Método | Endpoint                                                    | Uso                              |
|--------|--------------------------------------------------------------|----------------------------------|
| GET    | `/website/{websiteId}/page/{pageId}`                        | Carregar página por ID           |
| GET    | `/website/{websiteId}/page/{pageId}/content`                | Listar conteúdo da página        |
| POST   | `/website/{websiteId}/page/{pageId}/content`                | Criar novo part                  |
| PUT    | `/website/{websiteId}/page/{pageId}/content/{contentId}`    | Atualizar part                   |
| DELETE | `/website/{websiteId}/page/{pageId}/content/{contentId}`    | Deletar part                     |
| PUT    | `/website/{websiteId}/page/{pageId}/content/area`           | Salvar variáveis / reordenar     |
| POST   | `/image/upload`                                              | Upload de imagem                 |
