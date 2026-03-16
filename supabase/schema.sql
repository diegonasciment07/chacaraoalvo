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
CREATE POLICY "insert_public"
  ON orcamentos FOR INSERT
  TO anon
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
