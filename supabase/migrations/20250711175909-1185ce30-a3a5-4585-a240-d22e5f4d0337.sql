-- Inserir ferramentas administrativas para apenas admins
INSERT INTO public.lunna_tools (name, label, description, function_name, category, display_order, allowed_user_types) VALUES
-- Agendamentos
('listar_agendamentos', 'Listar Agendamentos', 'Lista todos os agendamentos do sistema com filtros', 'listar_agendamentos', 'agendamentos', 10, ARRAY['admin']),
('criar_agendamento', 'Criar Agendamento', 'Cria um novo agendamento para cliente e modelo', 'criar_agendamento', 'agendamentos', 11, ARRAY['admin']),
('atualizar_agendamento', 'Atualizar Agendamento', 'Atualiza informações de um agendamento existente', 'atualizar_agendamento', 'agendamentos', 12, ARRAY['admin']),
('deletar_agendamento', 'Deletar Agendamento', 'Remove um agendamento do sistema', 'deletar_agendamento', 'agendamentos', 13, ARRAY['admin']),

-- Modelos
('listar_modelos_admin', 'Listar Modelos (Admin)', 'Lista todas as modelos com informações administrativas', 'listar_modelos_admin', 'modelos', 20, ARRAY['admin']),
('criar_modelo', 'Criar Modelo', 'Cria um novo perfil de modelo no sistema', 'criar_modelo', 'modelos', 21, ARRAY['admin']),
('atualizar_modelo', 'Atualizar Modelo', 'Atualiza informações de uma modelo existente', 'atualizar_modelo', 'modelos', 22, ARRAY['admin']),
('deletar_modelo', 'Deletar Modelo', 'Remove uma modelo do sistema', 'deletar_modelo', 'modelos', 23, ARRAY['admin']),

-- Usuários
('listar_usuarios', 'Listar Usuários', 'Lista todos os usuários do sistema', 'listar_usuarios', 'usuarios', 30, ARRAY['admin']),
('criar_usuario', 'Criar Usuário', 'Cria um novo usuário no sistema', 'criar_usuario', 'usuarios', 31, ARRAY['admin']),
('atualizar_usuario', 'Atualizar Usuário', 'Atualiza informações de um usuário existente', 'atualizar_usuario', 'usuarios', 32, ARRAY['admin']),
('deletar_usuario', 'Deletar Usuário', 'Remove um usuário do sistema', 'deletar_usuario', 'usuarios', 33, ARRAY['admin']),

-- Metas
('listar_metas', 'Listar Metas', 'Lista todas as metas do sistema', 'listar_metas', 'metas', 40, ARRAY['admin']),
('criar_meta', 'Criar Meta', 'Cria uma nova meta para modelos', 'criar_meta', 'metas', 41, ARRAY['admin']),
('atualizar_meta', 'Atualizar Meta', 'Atualiza informações de uma meta existente', 'atualizar_meta', 'metas', 42, ARRAY['admin']),
('deletar_meta', 'Deletar Meta', 'Remove uma meta do sistema', 'deletar_meta', 'metas', 43, ARRAY['admin']),

-- Campos Customizados
('listar_campos_customizados', 'Listar Campos Customizados', 'Lista todos os campos customizados', 'listar_campos_customizados', 'campos', 50, ARRAY['admin']),
('criar_campo_customizado', 'Criar Campo Customizado', 'Cria um novo campo customizado', 'criar_campo_customizado', 'campos', 51, ARRAY['admin']),
('atualizar_campo_customizado', 'Atualizar Campo Customizado', 'Atualiza um campo customizado existente', 'atualizar_campo_customizado', 'campos', 52, ARRAY['admin']),
('deletar_campo_customizado', 'Deletar Campo Customizado', 'Remove um campo customizado do sistema', 'deletar_campo_customizado', 'campos', 53, ARRAY['admin']);