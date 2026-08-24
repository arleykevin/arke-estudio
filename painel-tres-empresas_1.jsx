import React, { useState, useEffect, useMemo, useRef } from "react";

/* ---------- tokens ---------- */
const C = {
  bg: "#FBF1EA",
  surface: "#FFFFFF",
  campo: "#FDF8F4",
  painel: "#FFFAF6",
  ink: "#2E1B22",
  muted: "#8A7178",
  faded: "#C4B4AC",
  line: "#F0E2D8",
  alert: "#F23D5E",
  atencao: "#F2BD1D",
  arke: "#F24182",
  condizz: "#04BFAD",
  proposital: "#F2784B",
};

const R = { card: 14, tile: 16, coluna: 20, campo: 10, pill: 999 };
const SOMBRA = "0 1px 2px rgba(46,27,34,.04), 0 6px 16px -8px rgba(46,27,34,.14)";
const SOMBRA_ALTA = "0 2px 5px rgba(46,27,34,.05), 0 18px 32px -12px rgba(46,27,34,.22)";

const tint = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const EMPRESAS = [
  { id: "arke", nome: "ARKE", cor: C.arke, atende: "ETCF" },
  { id: "condizz", nome: "Condizz", cor: C.condizz, atende: null },
  { id: "proposital", nome: "Proposi7al", cor: C.proposital, atende: "ICF" },
];

const AMBIENTES = ["ETCF", "ICF", "ARKE", "Proposi7al", "Todos os ambientes"];

const COLUNAS = [
  { id: "backlog", nome: "Backlog" },
  { id: "execucao", nome: "Em execução" },
  { id: "bloqueado", nome: "Bloqueado" },
  { id: "resolvido", nome: "Resolvido" },
];

const PRIORIDADES = [
  { id: "alta", nome: "Alta" },
  { id: "media", nome: "Média" },
  { id: "baixa", nome: "Baixa" },
];

const mono = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const sans = '"Duplet Rounded", "Helvetica Neue", Helvetica, Arial, sans-serif';
const STORAGE_KEY = "painel:board:v1";

/* ---------- datas ---------- */
const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};
const parseISO = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const diasEntre = (a, b) => Math.round((b - a) / 86400000);
const diasAte = (iso) => {
  const alvo = parseISO(iso);
  return alvo ? diasEntre(parseISO(hojeISO()), alvo) : null;
};
const fmtCurta = (iso) => {
  const d = parseISO(iso);
  if (!d) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

const empresaDe = (id) => EMPRESAS.find((e) => e.id === id) || EMPRESAS[0];
const uid = () => Math.random().toString(36).slice(2, 10);

const corEstado = (item) => {
  if (item.status === "resolvido") return C.faded;
  const d = diasAte(item.previsao);
  if (d === null) return empresaDe(item.empresa).cor;
  if (d < 0) return C.alert;
  if (d <= 2) return C.atencao;
  return empresaDe(item.empresa).cor;
};

const vazio = () => ({
  id: uid(),
  empresa: "arke",
  ambiente: "",
  titulo: "",
  problema: "",
  plano: "",
  solucao: "",
  responsavel: "",
  prioridade: "media",
  previsao: "",
  conclusao: "",
  status: "backlog",
  criadoEm: hojeISO(),
});

/* ---------- peças ---------- */
function Rotulo({ children, cor = C.muted, tamanho = 10.5 }) {
  return (
    <span
      style={{
        fontFamily: sans,
        fontWeight: 600,
        fontSize: tamanho,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: cor,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Ponto({ cor, tamanho = 8 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: tamanho,
        height: tamanho,
        background: cor,
        borderRadius: R.pill,
        flexShrink: 0,
      }}
    />
  );
}

/* selo da operação: cor como área, texto em tinta */
function Selo({ item }) {
  const emp = empresaDe(item.empresa);
  const escopo = emp.atende || item.ambiente;
  return (
    <span
      className="inline-flex items-center"
      style={{
        gap: 6,
        background: tint(emp.cor, 0.13),
        borderRadius: R.pill,
        padding: "4px 10px 4px 8px",
        maxWidth: "100%",
      }}
    >
      <Ponto cor={emp.cor} tamanho={7} />
      <Rotulo cor={C.ink} tamanho={10}>
        {emp.nome}
      </Rotulo>
      {escopo && (
        <>
          <span style={{ color: tint(C.ink, 0.3), fontSize: 10 }}>›</span>
          <Rotulo cor={tint(C.ink, 0.62)} tamanho={10}>
            {escopo}
          </Rotulo>
        </>
      )}
    </span>
  );
}

function Prazo({ item }) {
  if (item.status === "resolvido")
    return (
      <span style={{ fontFamily: mono, fontSize: 11, color: C.faded }}>
        ✓ {fmtCurta(item.conclusao || item.previsao)}
      </span>
    );
  const d = diasAte(item.previsao);
  if (d === null)
    return (
      <span style={{ fontFamily: sans, fontSize: 11, color: C.faded }}>sem prazo</span>
    );
  const atrasado = d < 0;
  const quente = atrasado || d <= 2;
  return (
    <span
      className="inline-flex items-center"
      style={{
        fontFamily: mono,
        fontSize: 11,
        fontWeight: 600,
        gap: 5,
        padding: quente ? "3px 8px" : "3px 0",
        borderRadius: R.pill,
        background: atrasado ? tint(C.alert, 0.12) : d <= 2 ? tint(C.atencao, 0.2) : "transparent",
        color: atrasado ? C.alert : d <= 2 ? "#8A6A00" : C.muted,
      }}
    >
      {d === 0 ? "hoje" : atrasado ? `D+${-d}` : `D-${d}`}
      <span style={{ opacity: 0.65 }}>{fmtCurta(item.previsao)}</span>
    </span>
  );
}

function BarraPrazo({ item }) {
  if (item.status === "resolvido" || !item.previsao) return null;
  const ini = parseISO(item.criadoEm) || parseISO(hojeISO());
  const total = Math.max(diasEntre(ini, parseISO(item.previsao)), 1);
  const gasto = diasEntre(ini, parseISO(hojeISO()));
  const estourou = gasto > total;
  return (
    <div
      style={{
        height: 4,
        background: C.line,
        borderRadius: R.pill,
        marginTop: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 4,
          borderRadius: R.pill,
          width: estourou ? "100%" : `${Math.max(3, Math.min(100, (gasto / total) * 100))}%`,
          background: corEstado(item),
          transition: "width .35s ease",
        }}
      />
    </div>
  );
}

function Tile({ rotulo, valor, sufixo, cor }) {
  const aceso = Boolean(cor);
  return (
    <div
      className="flex-1"
      style={{
        minWidth: 132,
        background: aceso ? tint(cor, 0.11) : C.surface,
        border: `1px solid ${aceso ? tint(cor, 0.28) : C.line}`,
        borderRadius: R.tile,
        padding: "15px 18px 16px",
      }}
    >
      <Rotulo cor={aceso ? cor : C.muted}>{rotulo}</Rotulo>
      <div
        style={{
          fontFamily: mono,
          fontSize: 36,
          lineHeight: 1,
          fontWeight: 600,
          marginTop: 10,
          letterSpacing: "-0.02em",
          color: aceso ? cor : C.ink,
        }}
      >
        {valor}
        {sufixo && (
          <span style={{ fontSize: 12, color: C.muted, marginLeft: 5, fontWeight: 500 }}>
            {sufixo}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- assinatura: régua de prazos ---------- */
function Regua({ itens, onAbrir }) {
  const dias = useMemo(() => {
    const base = parseISO(hojeISO());
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      return { i, data: d, fds: d.getDay() === 0 || d.getDay() === 6 };
    });
  }, []);

  const abertos = itens.filter((i) => i.status !== "resolvido" && i.previsao);
  const atrasados = abertos.filter((i) => diasAte(i.previsao) < 0);
  const noDia = (i) => abertos.filter((it) => diasAte(it.previsao) === i);
  const adiante = abertos.filter((i) => diasAte(i.previsao) > 13);
  const pico = Math.max(1, atrasados.length, ...dias.map((d) => noDia(d.i).length));

  const Pilha = ({ lista, corVazio }) => (
    <div
      className="flex flex-col-reverse items-center"
      style={{ gap: 3, minHeight: pico * 13, justifyContent: "flex-start" }}
    >
      {lista.slice(0, 6).map((it) => (
        <button
          key={it.id}
          onClick={() => onAbrir(it)}
          title={`${it.titulo} · ${empresaDe(it.empresa).nome}`}
          style={{
            width: 22,
            height: 10,
            borderRadius: R.pill,
            background: corVazio || empresaDe(it.empresa).cor,
            border: "none",
            cursor: "pointer",
            display: "block",
          }}
        />
      ))}
      {lista.length > 6 && (
        <span style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>+{lista.length - 6}</span>
      )}
    </div>
  );

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.line}`,
        borderRadius: R.tile,
        padding: "16px 18px 14px",
        marginBottom: 12,
        overflowX: "auto",
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <Rotulo cor={C.ink}>Régua de prazos · próximos 14 dias</Rotulo>
        {adiante.length > 0 && (
          <Rotulo>+{adiante.length} depois</Rotulo>
        )}
      </div>

      <div className="flex items-end" style={{ gap: 4, minWidth: 620 }}>
        {/* balde de atrasados */}
        <div
          className="flex flex-col items-center"
          style={{
            background: atrasados.length ? tint(C.alert, 0.1) : "transparent",
            border: `1px dashed ${atrasados.length ? tint(C.alert, 0.4) : C.line}`,
            borderRadius: R.campo,
            padding: "8px 10px",
            marginRight: 8,
          }}
        >
          <Pilha lista={atrasados} corVazio={C.alert} />
          <div style={{ marginTop: 8, textAlign: "center" }}>
            <Rotulo cor={atrasados.length ? C.alert : C.faded} tamanho={9}>
              atrasado
            </Rotulo>
          </div>
        </div>

        {dias.map((d) => {
          const lista = noDia(d.i);
          const hoje = d.i === 0;
          return (
            <div key={d.i} className="flex flex-col items-center flex-1" style={{ minWidth: 30 }}>
              <Pilha lista={lista} />
              <div
                className="flex flex-col items-center"
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: "5px 0 4px",
                  borderRadius: R.campo,
                  background: hoje ? C.ink : "transparent",
                  opacity: d.fds && !hoje ? 0.4 : 1,
                }}
              >
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 12,
                    fontWeight: 600,
                    color: hoje ? C.bg : C.ink,
                  }}
                >
                  {d.data.getDate()}
                </span>
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: hoje ? tint("#FBF1EA", 0.75) : C.faded,
                  }}
                >
                  {hoje ? "HOJE" : SEMANA[d.data.getDay()]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- card ---------- */
function Card({ item, onOpen, onDragStart }) {
  const [alto, setAlto] = useState(false);
  const atrasado = item.status !== "resolvido" && diasAte(item.previsao) < 0;
  const resolvido = item.status === "resolvido";
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onClick={() => onOpen(item)}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(item))
      }
      onMouseEnter={() => setAlto(true)}
      onMouseLeave={() => setAlto(false)}
      tabIndex={0}
      role="button"
      className="cursor-pointer focus:outline-none"
      style={{
        background: C.surface,
        borderRadius: R.card,
        border: `1.5px solid ${atrasado ? tint(C.alert, 0.55) : C.line}`,
        boxShadow: alto ? SOMBRA_ALTA : SOMBRA,
        transform: alto ? "translateY(-2px)" : "none",
        transition: "box-shadow .2s ease, transform .2s ease",
        padding: 14,
        marginBottom: 10,
        opacity: resolvido ? 0.66 : 1,
      }}
    >
      <div className="flex items-start justify-between" style={{ gap: 8, marginBottom: 9 }}>
        <Selo item={item} />
        {item.prioridade === "alta" && !resolvido && (
          <span
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 9,
              letterSpacing: "0.1em",
              color: C.alert,
              background: tint(C.alert, 0.12),
              borderRadius: R.pill,
              padding: "4px 8px",
              flexShrink: 0,
            }}
          >
            ALTA
          </span>
        )}
      </div>

      <div
        style={{
          fontFamily: sans,
          fontSize: 14.5,
          fontWeight: 600,
          lineHeight: 1.32,
          color: C.ink,
          textDecoration: resolvido ? "line-through" : "none",
          textDecorationColor: C.faded,
        }}
      >
        {item.titulo || "Sem título"}
      </div>

      {item.problema && (
        <div
          style={{
            fontFamily: sans,
            fontSize: 12.5,
            lineHeight: 1.45,
            color: C.muted,
            marginTop: 6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.problema}
        </div>
      )}

      <div className="flex items-center justify-between" style={{ marginTop: 11, gap: 8 }}>
        <span
          className="inline-flex items-center"
          style={{ gap: 6, minWidth: 0, fontFamily: sans, fontSize: 11.5, color: C.muted }}
        >
          {item.responsavel ? (
            <>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: R.pill,
                  background: tint(C.ink, 0.07),
                  color: C.ink,
                  fontSize: 9.5,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.responsavel.trim().slice(0, 2).toUpperCase()}
              </span>
              <span className="truncate">{item.responsavel}</span>
            </>
          ) : (
            <span style={{ color: C.faded }}>sem dono</span>
          )}
        </span>
        <Prazo item={item} />
      </div>

      <BarraPrazo item={item} />
    </div>
  );
}

/* ---------- editor ---------- */
function Campo({ label, children }) {
  return (
    <label className="block" style={{ marginBottom: 15 }}>
      <div style={{ marginBottom: 6 }}>
        <Rotulo>{label}</Rotulo>
      </div>
      {children}
    </label>
  );
}

const inputBase = {
  width: "100%",
  fontFamily: sans,
  fontSize: 14,
  color: C.ink,
  background: C.campo,
  border: `1.5px solid ${C.line}`,
  borderRadius: R.campo,
  padding: "10px 12px",
  outline: "none",
};

const botao = (variante) => ({
  fontFamily: sans,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  borderRadius: R.pill,
  padding: "11px 22px",
  border: "none",
  cursor: "pointer",
  ...(variante === "cheio"
    ? { background: C.ink, color: C.bg }
    : variante === "perigo"
    ? { background: "transparent", color: C.alert, padding: "11px 4px" }
    : { background: "transparent", color: C.muted }),
});

function Editor({ item, onSalvar, onExcluir, onFechar }) {
  const [f, setF] = useState(item);
  const ref = useRef(null);
  useEffect(() => setF(item), [item]);
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", h);
    ref.current?.focus();
    return () => window.removeEventListener("keydown", h);
  }, [onFechar]);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const salvar = () => {
    const limpo = { ...f, titulo: f.titulo.trim() || "Sem título" };
    limpo.conclusao = limpo.status === "resolvido" ? limpo.conclusao || hojeISO() : "";
    onSalvar(limpo);
  };
  const emp = empresaDe(f.empresa);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ background: "rgba(46,27,34,.44)", backdropFilter: "blur(3px)", padding: "5vh 16px" }}
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        style={{
          background: C.surface,
          width: "100%",
          maxWidth: 640,
          borderRadius: R.coluna,
          boxShadow: SOMBRA_ALTA,
          overflow: "hidden",
        }}
      >
        <div style={{ height: 5, background: emp.cor, transition: "background .25s" }} />
        <div
          className="flex items-center justify-between"
          style={{ padding: "16px 24px", borderBottom: `1px solid ${C.line}` }}
        >
          <Rotulo cor={C.ink}>{item.titulo ? "Editar item" : "Novo item"}</Rotulo>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            style={{
              fontFamily: sans,
              fontSize: 15,
              color: C.muted,
              background: tint(C.ink, 0.05),
              border: "none",
              borderRadius: R.pill,
              width: 30,
              height: 30,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <Campo label="Título">
            <input
              ref={ref}
              style={{ ...inputBase, fontSize: 16.5, fontWeight: 600 }}
              value={f.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder="Resumo em uma linha"
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Operação">
              <select
                style={inputBase}
                value={f.empresa}
                onChange={(e) =>
                  setF((p) => ({
                    ...p,
                    empresa: e.target.value,
                    ambiente: e.target.value === "condizz" ? p.ambiente : "",
                  }))
                }
              >
                {EMPRESAS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.atende ? `${e.nome} · ${e.atende}` : e.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Responsável">
              <input
                style={inputBase}
                value={f.responsavel}
                onChange={(e) => set("responsavel", e.target.value)}
                placeholder="Quem toca"
              />
            </Campo>
          </div>

          {f.empresa === "condizz" && (
            <Campo label="Ambiente afetado">
              <select
                style={inputBase}
                value={f.ambiente}
                onChange={(e) => set("ambiente", e.target.value)}
              >
                <option value="">Selecione o ambiente</option>
                {AMBIENTES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Campo>
          )}

          <Campo label="Problema — o que está travando">
            <textarea
              style={{ ...inputBase, minHeight: 76, resize: "vertical" }}
              value={f.problema}
              onChange={(e) => set("problema", e.target.value)}
            />
          </Campo>

          <Campo label="Plano de ação — como pretendemos resolver">
            <textarea
              style={{ ...inputBase, minHeight: 76, resize: "vertical" }}
              value={f.plano}
              onChange={(e) => set("plano", e.target.value)}
            />
          </Campo>

          <Campo label="Solução — o que de fato foi feito">
            <textarea
              style={{
                ...inputBase,
                minHeight: 76,
                resize: "vertical",
                background: f.status === "resolvido" ? C.surface : C.campo,
                borderColor: f.status === "resolvido" ? C.condizz : C.line,
              }}
              value={f.solucao}
              onChange={(e) => set("solucao", e.target.value)}
              placeholder={
                f.status === "resolvido"
                  ? "Registre o que resolveu — é isso que fica no histórico"
                  : "Preencher ao concluir"
              }
            />
          </Campo>

          <div className="grid grid-cols-3 gap-3">
            <Campo label="Status">
              <select style={inputBase} value={f.status} onChange={(e) => set("status", e.target.value)}>
                {COLUNAS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Prioridade">
              <select
                style={inputBase}
                value={f.prioridade}
                onChange={(e) => set("prioridade", e.target.value)}
              >
                {PRIORIDADES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Previsão">
              <input
                type="date"
                style={{ ...inputBase, fontFamily: mono, fontSize: 13 }}
                value={f.previsao}
                onChange={(e) => set("previsao", e.target.value)}
              />
            </Campo>
          </div>
        </div>

        <div
          className="flex items-center justify-between"
          style={{ padding: "14px 24px", borderTop: `1px solid ${C.line}`, background: C.painel }}
        >
          <button onClick={() => onExcluir(f.id)} style={botao("perigo")}>
            Excluir
          </button>
          <div className="flex items-center gap-1">
            <button onClick={onFechar} style={botao("vazio")}>
              Cancelar
            </button>
            <button onClick={salvar} style={botao("cheio")}>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- app ---------- */
export default function Painel() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);
  const [filtroEmpresa, setFiltroEmpresa] = useState("todas");
  const [filtroResp, setFiltroResp] = useState("todos");
  const [sobre, setSobre] = useState(null);
  const arrastado = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY, true);
        if (r?.value) setItens(JSON.parse(r.value).itens || []);
      } catch {
        /* primeira abertura */
      }
      setCarregando(false);
    })();
  }, []);

  const persistir = async (novos) => {
    setItens(novos);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify({ itens: novos }), true);
      setErro("");
    } catch {
      setErro("Não foi possível salvar. Sua última alteração está só nesta tela.");
    }
  };

  const salvar = (item) => {
    const existe = itens.some((i) => i.id === item.id);
    persistir(existe ? itens.map((i) => (i.id === item.id ? item : i)) : [...itens, item]);
    setEditando(null);
  };
  const excluir = (id) => {
    persistir(itens.filter((i) => i.id !== id));
    setEditando(null);
  };
  const mover = (id, status) =>
    persistir(
      itens.map((i) =>
        i.id === id
          ? { ...i, status, conclusao: status === "resolvido" ? i.conclusao || hojeISO() : "" }
          : i
      )
    );

  const responsaveis = useMemo(
    () => [...new Set(itens.map((i) => i.responsavel).filter(Boolean))].sort(),
    [itens]
  );

  const visiveis = useMemo(
    () =>
      itens.filter(
        (i) =>
          (filtroEmpresa === "todas" || i.empresa === filtroEmpresa) &&
          (filtroResp === "todos" || i.responsavel === filtroResp)
      ),
    [itens, filtroEmpresa, filtroResp]
  );

  const m = useMemo(() => {
    const abertos = visiveis.filter((i) => i.status !== "resolvido");
    const conta = (fn) => abertos.filter(fn).length;
    const agora = new Date();
    const mes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
    const ciclos = visiveis
      .filter((i) => i.status === "resolvido" && i.conclusao && i.criadoEm)
      .map((i) => diasEntre(parseISO(i.criadoEm), parseISO(i.conclusao)));
    return {
      atrasados: conta((i) => {
        const d = diasAte(i.previsao);
        return d !== null && d < 0;
      }),
      semana: conta((i) => {
        const d = diasAte(i.previsao);
        return d !== null && d >= 0 && d <= 7;
      }),
      bloqueados: conta((i) => i.status === "bloqueado"),
      noMes: visiveis.filter((i) => i.status === "resolvido" && (i.conclusao || "").startsWith(mes))
        .length,
      medio: ciclos.length ? Math.round(ciclos.reduce((a, b) => a + b, 0) / ciclos.length) : null,
    };
  }, [visiveis]);

  const contagem = (id) =>
    itens.filter((i) => i.status !== "resolvido" && (id === "todas" || i.empresa === id)).length;

  const novo = () =>
    setEditando({ ...vazio(), empresa: filtroEmpresa === "todas" ? "arke" : filtroEmpresa });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: sans, color: C.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');@font-face{font-family:'Duplet Rounded';font-style:normal;font-weight:400;font-display:swap;src:url(data:font/woff2;base64,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) format('woff2');}@font-face{font-family:'Duplet Rounded';font-style:normal;font-weight:600;font-display:swap;src:url(data:font/woff2;base64,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) format('woff2');}@font-face{font-family:'Duplet Rounded';font-style:normal;font-weight:700;font-display:swap;src:url(data:font/woff2;base64,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) format('woff2');}
        *:focus-visible { outline: 2.5px solid ${C.ink}; outline-offset: 3px; border-radius: 4px; }
        input:focus, textarea:focus, select:focus { background:${C.surface}; border-color:${C.ink}; }
        ::placeholder { color: ${C.faded}; }
        button { font: inherit; }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 99px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "30px 20px 70px" }}>
        {/* cabeçalho */}
        <div className="flex flex-wrap items-end justify-between gap-4" style={{ marginBottom: 22 }}>
          <div>
            <Rotulo>Painel de pendências · {fmtCurta(hojeISO())}</Rotulo>
            <h1
              style={{
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.08,
                marginTop: 7,
              }}
            >
              {EMPRESAS.map((e, k) => (
                <React.Fragment key={e.id}>
                  {k > 0 && <span style={{ color: C.faded, margin: "0 8px" }}>/</span>}
                  <span style={{ color: e.cor }}>{e.nome}</span>
                </React.Fragment>
              ))}
            </h1>
            <div style={{ fontFamily: sans, fontSize: 13, color: C.muted, marginTop: 6 }}>
              Ecossistema Cinthia França
            </div>
          </div>
          <button onClick={novo} style={{ ...botao("cheio"), boxShadow: SOMBRA }}>
            + Novo item
          </button>
        </div>

        {erro && (
          <div
            style={{
              fontFamily: sans,
              fontSize: 12.5,
              color: C.alert,
              background: tint(C.alert, 0.1),
              border: `1px solid ${tint(C.alert, 0.3)}`,
              borderRadius: R.campo,
              padding: "11px 15px",
              marginBottom: 14,
            }}
          >
            {erro}
          </div>
        )}

        {/* métricas */}
        <div className="flex flex-wrap gap-3" style={{ marginBottom: 12 }}>
          <Tile rotulo="Atrasados" valor={m.atrasados} cor={m.atrasados > 0 ? C.alert : null} />
          <Tile rotulo="Próximos 7 dias" valor={m.semana} />
          <Tile
            rotulo="Bloqueados"
            valor={m.bloqueados}
            cor={m.bloqueados > 0 ? C.atencao : null}
          />
          <Tile rotulo="Resolvidos no mês" valor={m.noMes} />
          <Tile
            rotulo="Ciclo médio"
            valor={m.medio === null ? "—" : m.medio}
            sufixo={m.medio === null ? "" : "dias"}
          />
        </div>

        {!carregando && <Regua itens={visiveis} onAbrir={setEditando} />}

        {/* filtros */}
        <div className="flex flex-wrap items-center gap-2" style={{ margin: "20px 0 14px" }}>
          {[{ id: "todas", nome: "Todas", cor: null }, ...EMPRESAS].map((e) => {
            const ativo = filtroEmpresa === e.id;
            return (
              <button
                key={e.id}
                onClick={() => setFiltroEmpresa(e.id)}
                className="inline-flex items-center"
                style={{
                  gap: 7,
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 12.5,
                  padding: "9px 16px",
                  borderRadius: R.pill,
                  cursor: "pointer",
                  background: ativo ? C.ink : C.surface,
                  color: ativo ? C.bg : C.ink,
                  border: `1.5px solid ${ativo ? C.ink : C.line}`,
                  transition: "background .15s",
                }}
              >
                {e.cor && <Ponto cor={e.cor} tamanho={8} />}
                {e.nome}
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    color: ativo ? tint("#FBF1EA", 0.7) : C.muted,
                  }}
                >
                  {contagem(e.id)}
                </span>
              </button>
            );
          })}
          {responsaveis.length > 0 && (
            <select
              value={filtroResp}
              onChange={(e) => setFiltroResp(e.target.value)}
              style={{
                fontFamily: sans,
                fontSize: 12.5,
                padding: "9px 14px",
                borderRadius: R.pill,
                border: `1.5px solid ${C.line}`,
                background: C.surface,
                color: C.muted,
                outline: "none",
              }}
            >
              <option value="todos">Todos os responsáveis</option>
              {responsaveis.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* kanban */}
        {carregando ? (
          <div style={{ fontFamily: sans, fontSize: 13, color: C.muted, padding: 50 }}>
            Carregando o quadro…
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {COLUNAS.map((col) => {
              const desta = visiveis.filter((i) => i.status === col.id);
              const ativo = sobre === col.id;
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setSobre(col.id);
                  }}
                  onDragLeave={() => setSobre((s) => (s === col.id ? null : s))}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (arrastado.current) mover(arrastado.current, col.id);
                    arrastado.current = null;
                    setSobre(null);
                  }}
                  style={{
                    background: ativo ? tint(C.condizz, 0.07) : C.painel,
                    border: `1.5px ${ativo ? "dashed" : "solid"} ${ativo ? C.condizz : C.line}`,
                    borderRadius: R.coluna,
                    padding: 11,
                    minHeight: 260,
                    transition: "background .18s, border-color .18s",
                  }}
                >
                  <div
                    className="flex items-center justify-between"
                    style={{ padding: "3px 4px 12px" }}
                  >
                    <Rotulo cor={C.ink}>{col.nome}</Rotulo>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.muted,
                        background: tint(C.ink, 0.06),
                        borderRadius: R.pill,
                        padding: "3px 9px",
                      }}
                    >
                      {desta.length}
                    </span>
                  </div>

                  {desta.length === 0 ? (
                    <div
                      style={{
                        fontFamily: sans,
                        fontSize: 12.5,
                        color: C.faded,
                        padding: "26px 10px",
                        lineHeight: 1.6,
                        textAlign: "center",
                      }}
                    >
                      {col.id === "backlog"
                        ? "Arraste um card até aqui ou crie o primeiro item."
                        : "Nada aqui."}
                    </div>
                  ) : (
                    desta
                      .slice()
                      .sort((a, b) => (a.previsao || "9999").localeCompare(b.previsao || "9999"))
                      .map((i) => (
                        <Card
                          key={i.id}
                          item={i}
                          onOpen={setEditando}
                          onDragStart={(e, id) => {
                            arrastado.current = id;
                            e.dataTransfer.effectAllowed = "move";
                          }}
                        />
                      ))
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ fontFamily: sans, fontSize: 11.5, color: C.faded, marginTop: 30 }}>
          Base compartilhada · todos que abrirem este painel veem e editam os mesmos itens
        </div>
      </div>

      {editando && (
        <Editor
          item={editando}
          onSalvar={salvar}
          onExcluir={excluir}
          onFechar={() => setEditando(null)}
        />
      )}
    </div>
  );
}
