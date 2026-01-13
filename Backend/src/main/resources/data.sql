-- =================================================================
-- 1. CADASTROS BÁSICOS E INDEPENDENTES
-- =================================================================

INSERT INTO STATUS (sta_descricao, sta_ativo) VALUES
('EM ABERTO', TRUE), ('SEPARADO', TRUE), ('PAGO', TRUE), ('ENTREGUE', TRUE), ('CONCLUÍDO', TRUE), ('CANCELADO', TRUE);

INSERT INTO FORMA_PAGAMENTO (fop_descricao, fop_ativo) VALUES
('PIX', TRUE), ('Cartão de Crédito', TRUE), ('Dinheiro', TRUE);

INSERT INTO CATEGORIA (cat_nome, cat_descricao, cat_ativo) VALUES
('Queijos', 'Variedades de queijos artesanais e industriais.', TRUE),
('Massas', 'Massas frescas e recheadas.', TRUE),
('Embutidos', 'Linguiças, salames e outros produtos.', TRUE),
('Bebidas', 'Sucos, refrigerantes e outras bebidas.', TRUE);

INSERT INTO MEDIDA (med_nome, med_ativo) VALUES
('KG', TRUE), ('Unidade', TRUE), ('Grama', TRUE), ('Litro', TRUE);

-- =================================================================
-- 2. USUÁRIOS E FORNECEDORES
-- =================================================================

-- Senha para todos os usuários é 'senha123' (hash: $2a$10$N9qo8uLOickgx2ZMRZoMye.a532t5jAvp.gq0b2d5.k.o.dG2k37W)
INSERT INTO USUARIO (usu_nome_usuario, usu_senha, usu_nome, usu_sobrenome, usu_cpf, usu_celular, usu_email, usu_data_nascimento, usu_admin, usu_ativo, usu_data_cadastro) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.a532t5jAvp.gq0b2d5.k.o.dG2k37W', 'Admin', 'Sistema', '11111111111', '79999999999', 'admin@email.com', '1990-01-01', TRUE, TRUE, CURRENT_TIMESTAMP),
('ana.silva', '$2a$10$N9qo8uLOickgx2ZMRZoMye.a532t5jAvp.gq0b2d5.k.o.dG2k37W', 'Ana', 'Silva', '22222222222', '79988888888', 'ana.silva@email.com', '1995-05-10', FALSE, TRUE, CURRENT_TIMESTAMP),
('joao.costa', '$2a$10$N9qo8uLOickgx2ZMRZoMye.a532t5jAvp.gq0b2d5.k.o.dG2k37W', 'João', 'Costa', '33333333333', '79977777777', 'joao.costa@email.com', '1988-11-20', FALSE, TRUE, CURRENT_TIMESTAMP);

INSERT INTO FORNECEDOR (for_empresa, for_cnpj, for_telefone_empresa, for_nome_vendedor, for_celular_vendedor, for_email, for_ativo) VALUES
('Laticínios da Serra', '11222333000144', '1140028922', 'Carlos', '35999887766', 'contato@laticiniosserra.com', TRUE),
('Massas da Nona', '44555666000177', '1155554444', 'Giuseppe', '11988776655', 'contato@massasdanona.com', TRUE),
('Embutidos do Sul', '77888999000100', '5133445566', 'Roberto', '51988887777', 'vendas@embutidosdosul.com.br', TRUE);

-- =================================================================
-- 3. PRODUTOS E ENDEREÇOS
-- =================================================================

INSERT INTO PRODUTO (pro_nome, pro_descricao, pro_valor, pro_estoque, cat_id, med_id, pro_ativo, pro_data_cadastro) VALUES
('Queijo Coalho', 'Queijo coalho artesanal, ideal para assar.', 45.50, 20, 1, 1, TRUE, CURRENT_TIMESTAMP),
('Mussarela Trançada', 'Mussarela fresca em formato de trança com temperos.', 55.00, 15, 1, 1, TRUE, CURRENT_TIMESTAMP),
('Ravioli de Carne', 'Massa fresca recheada com carne.', 30.00, 40, 2, 2, TRUE, CURRENT_TIMESTAMP),
('Linguiça Toscana', 'Linguiça de porco fresca para churrasco.', 25.00, 50, 3, 1, TRUE, CURRENT_TIMESTAMP),
('Suco de Uva Integral', 'Suco de uva sem adição de açúcar.', 15.00, 30, 4, 2, TRUE, CURRENT_TIMESTAMP);

INSERT INTO ENDERECO (end_logradouro, end_numero, end_complemento, end_bairro, end_cidade, end_uf, end_cep) VALUES
('Avenida Beira Mar', '1000', 'Apto 501', '13 de Julho', 'Aracaju', 'SE', '49020010'),
('Rua dos Testes', '456', NULL, 'Centro', 'São Cristóvão', 'SE', '49100000'),
('Praça da Bandeira', '200', 'Casa', 'Siqueira Campos', 'Aracaju', 'SE', '49075000');

-- VINCULANDO ENDEREÇOS AOS USUÁRIOS
INSERT INTO USUARIO_ENDERECO (usu_id, end_id, usuend_principal, usuend_ativo) VALUES
(2, 1, TRUE, TRUE),  -- Endereço principal da cliente Ana
(2, 2, FALSE, TRUE), -- Endereço secundário da cliente Ana
(3, 3, TRUE, TRUE);  -- Endereço principal do cliente João

-- =================================================================
-- 4. TRANSAÇÕES: COMPRAS E VENDAS
-- =================================================================

-- COMPRAS (para popular o histórico de compras)
INSERT INTO COMPRA_ITEM (pro_id, for_id, com_quantidade, com_valor, com_total, com_data) VALUES
(1, 1, 10.00, 25.00, 250.00, '2025-07-10'),
(4, 3, 30.00, 15.00, 450.00, '2025-07-11'),
(3, 2, 20.00, 18.00, 360.00, '2025-07-12'),
(5, 3, 20.00, 8.00, 160.00, '2025-08-01');

-- VENDAS (para popular o histórico de vendas)
-- Venda 1: Concluída (Julho)
INSERT INTO VENDA (usuend_id, fop_id, sta_id, ven_entrega, ven_total_bruto, ven_total_liquido, ven_data_hora, ven_data_hora_pagamento, ven_data_hora_da_entrega) VALUES
(1, 1, 5, TRUE, 146.00, 146.00, '2025-07-15 10:00:00', '2025-07-15 10:01:00', '2025-07-15 11:30:00');
INSERT INTO VENDA_ITEM (ven_id, pro_id, venitem_quantidade, venitem_valor) VALUES
(1, 1, 2.0, 45.50),
(1, 2, 1.0, 55.00);

-- Venda 2: Em Aberto (Julho)
INSERT INTO VENDA (usuend_id, fop_id, sta_id, ven_entrega, ven_total_bruto, ven_total_liquido, ven_data_hora) VALUES
(2, 2, 1, FALSE, 30.00, 30.00, '2025-07-20 14:00:00');
INSERT INTO VENDA_ITEM (ven_id, pro_id, venitem_quantidade, venitem_valor) VALUES
(2, 3, 1.0, 30.00);

-- Venda 3: Cancelada (Julho)
INSERT INTO VENDA (usuend_id, fop_id, sta_id, ven_entrega, ven_total_bruto, ven_total_liquido, ven_data_hora) VALUES
(1, 1, 6, TRUE, 45.50, 45.50, '2025-07-22 09:00:00');
INSERT INTO VENDA_ITEM (ven_id, pro_id, venitem_quantidade, venitem_valor) VALUES
(3, 1, 1.0, 45.50);

-- Venda 4: Concluída (Agosto)
INSERT INTO VENDA (usuend_id, fop_id, sta_id, ven_entrega, ven_total_bruto, ven_total_liquido, ven_desconto, ven_data_hora, ven_data_hora_pagamento, ven_data_hora_da_entrega) VALUES
(3, 1, 5, TRUE, 40.00, 35.00, 5.00, '2025-08-05 18:00:00', '2025-08-05 18:01:00', '2025-08-06 10:00:00');
INSERT INTO VENDA_ITEM (ven_id, pro_id, venitem_quantidade, venitem_valor) VALUES
(4, 4, 1.0, 25.00),
(4, 5, 1.0, 15.00);