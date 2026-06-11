# ARKE Estúdio — Site Institucional

Site institucional da **ARKE Estúdio**, agência criativa especializada em design gráfico, marketing digital e estratégias de crescimento online.

O projeto é um site estático (HTML/CSS/JS) servido por um backend leve em **Node.js + Express**, com um **painel administrativo** que permite editar o conteúdo do site sem mexer no código.

---

## ✨ Recursos

- **Landing page** responsiva com tema escuro e identidade visual da marca
- **Conteúdo dinâmico** — todas as seções (hero, serviços, processo, diferenciais, FAQ etc.) são alimentadas por um arquivo `data.json`
- **Painel admin** (`admin.html`) para editar os textos do site, protegido por senha
- **API REST** simples (`/api/data`) para ler e gravar o conteúdo
- Animações de scroll, menu mobile e suporte a `prefers-reduced-motion`

---

## 🛠️ Tecnologias

| Camada      | Stack                                   |
|-------------|-----------------------------------------|
| Front-end   | HTML, CSS, JavaScript (vanilla)         |
| Back-end    | Node.js, Express                        |
| Ícones      | [Lucide](https://lucide.dev)            |
| Tipografia  | Google Fonts (Outfit + Inter)           |

---

## 🚀 Como rodar localmente

Pré-requisito: [Node.js](https://nodejs.org) instalado.

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor
npm start
```

O site ficará disponível em **http://localhost:8080**

| Endereço                          | Página                        |
|-----------------------------------|-------------------------------|
| `http://localhost:8080/`          | Site institucional            |
| `http://localhost:8080/admin.html`| Painel administrativo         |

> A porta pode ser alterada pela variável de ambiente `PORT`.

---

## 📝 Editando o conteúdo

Há duas formas de alterar os textos do site:

1. **Pelo painel admin** (recomendado): acesse `/admin.html`, entre com a senha e edite pela interface. As alterações são salvas em `data.json`.
2. **Direto no arquivo**: edite o `data.json` manualmente. O front-end consome `/api/data` e, caso o servidor não esteja rodando, faz fallback para o próprio `data.json`.

---

## 📂 Estrutura do projeto

```
arke-estudio/
├── index.html        # Página principal (landing)
├── admin.html        # Painel administrativo
├── styles.css        # Estilos do site
├── script.js         # Lógica do front-end (render dinâmico, menu, animações)
├── server.js         # Servidor Express + API
├── data.json         # Conteúdo editável do site
├── logo-arke.svg     # Logo vetorial da marca
└── package.json
```

---

## 📄 Licença

Projeto privado — © ARKE Estúdio. Todos os direitos reservados.
