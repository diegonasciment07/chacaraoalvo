-- ══════════════════════════════════════════════════════════════
--  Chácara O Alvo — Supabase Schema
--  Execute no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════════════

-- Tabela de solicitações de orçamento
CREATE TABLE IF NOT EXISTS orcamentos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- Dados pessoais
  nome            text NOT NULL,
  email           text NOT NULL,
  telefone        text NOT NULL,

  -- Evento
  tipo_evento     text[],          -- múltipla escolha
  convidados      text,
  data_evento     date,
  flexibilidade   boolean DEFAULT false,

  -- Espaços e serviços
  espacos         text[],
  servicos        text[],

  -- Investimento e origem
  investimento    text,
  como_conheceu   text,

  -- Mensagem livre
  mensagem        text,

  -- Controle interno
  status          text NOT NULL DEFAULT 'novo'  -- novo | em_atendimento | fechado
    CHECK (status IN ('novo', 'em_atendimento', 'fechado')),
  observacoes     text
);

-- Índices
CREATE INDEX IF NOT EXISTS orcamentos_created_at_idx ON orcamentos (created_at DESC);
CREATE INDEX IF NOT EXISTS orcamentos_status_idx     ON orcamentos (status);

-- Row Level Security
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode inserir (formulário público)
-- Sem restrição de role para compatibilidade com o novo formato sb_publishable_
CREATE POLICY "insert_public"
  ON orcamentos FOR INSERT
  WITH CHECK (true);

-- Somente autenticados podem ler e atualizar (admin)
CREATE POLICY "select_authenticated"
  ON orcamentos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "update_authenticated"
  ON orcamentos FOR UPDATE
  TO authenticated
  USING (true);


-- ══════════════════════════════════════════════════════════════
--  Tabela AGENDA — datas bloqueadas (visível publicamente)
--  O calendário do site lê desta tabela para mostrar disponibilidade
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agenda (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  data          date NOT NULL UNIQUE,              -- data do evento (YYYY-MM-DD)
  orcamento_id  uuid REFERENCES orcamentos(id) ON DELETE SET NULL,
  descricao     text,                              -- ex: "Casamento Silva" (uso interno)
  status        text NOT NULL DEFAULT 'reservado'
    CHECK (status IN ('reservado', 'bloqueado'))   -- bloqueado = manutenção etc.
);

CREATE INDEX IF NOT EXISTS agenda_data_idx ON agenda (data);

ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;

-- Visitantes anônimos podem LER (para o calendário do site)
CREATE POLICY "agenda_select_public"
  ON agenda FOR SELECT
  USING (true);

-- Somente admins autenticados podem gravar / alterar / excluir
CREATE POLICY "agenda_insert_authenticated"
  ON agenda FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "agenda_update_authenticated"
  ON agenda FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "agenda_delete_authenticated"
  ON agenda FOR DELETE
  TO authenticated
  USING (true);

-- ══════════════════════════════════════════════════════════════
--  Datas já reservadas (para popular o calendário inicial)
--  Execute este INSERT após criar a tabela acima
-- ══════════════════════════════════════════════════════════════

INSERT INTO agenda (data, descricao, status) VALUES
  ('2026-04-25', 'Reservado', 'reservado'),
  ('2026-05-02', 'Reservado', 'reservado'),
  ('2026-05-23', 'Reservado', 'reservado'),
  ('2026-06-13', 'Reservado', 'reservado')
ON CONFLICT (data) DO NOTHING;
