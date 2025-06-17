// server.js
// Importação dos módulos necessários
const express = require('express');
const mysql = require('mysql2/promise'); // Usando a versão com Promises do mysql2
const cors = require('cors');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// Inicialização do aplicativo Express
const app = express();
const port = process.env.PORT || 3001; // Usa a porta do .env ou 3001 como padrão

// Middlewares
app.use(cors()); // Habilita o CORS para permitir requisições de diferentes origens (seu front-end)
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// --- Configuração do Pool de Conexões com o MySQL ---
// Um pool de conexões melhora a performance, reutilizando conexões em vez de criar uma nova a cada requisição.
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, // Espera por uma conexão se todas estiverem em uso
    connectionLimit: 10,      // Número máximo de conexões no pool
    queueLimit: 0             // Fila de requisições ilimitada
});

// --- Função Auxiliar para tratamento de campos JSON ---
// Converte campos que são JSON em string antes de salvar e faz o parse ao ler.
const parseJsonFields = (item, fields) => {
    const newItem = { ...item };
    for (const field of fields) {
        if (newItem[field] && typeof newItem[field] === 'string') {
            try {
                newItem[field] = JSON.parse(newItem[field]);
            } catch (e) {
                console.error(`Erro ao fazer parse do campo JSON '${field}':`, e);
                // Mantém o valor original se o parse falhar
            }
        }
    }
    return newItem;
};

// --- Rotas da API (Endpoints) ---

// Rota de teste para verificar se o servidor está online
app.get('/', (req, res) => {
    res.send('API da Conservadora Rodrigues está no ar!');
});


/*
 * =================================================================
 * CRUD para a tabela 'condominios'
 * =================================================================
 */

// GET todos os condomínios
app.get('/api/condominios', async (req, res) => {
    try {
        const [rows] = await dbPool.execute('SELECT * FROM condominios ORDER BY nome');
        const condominios = rows.map(c => parseJsonFields(c, ['transporte_onibus_detalhes']));
        res.json(condominios);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar condomínios: ' + error.message });
    }
});

// GET um condomínio por ID
app.get('/api/condominios/:id', async (req, res) => {
    try {
        const [rows] = await dbPool.execute('SELECT * FROM condominios WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Condomínio não encontrado.' });
        const condominio = parseJsonFields(rows[0], ['transporte_onibus_detalhes']);
        res.json(condominio);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar condomínio: ' + error.message });
    }
});

// POST (criar) um novo condomínio
app.post('/api/condominios', async (req, res) => {
    try {
        const { nome, endereco, cnpj, ...outrosCampos } = req.body;
        // Validação básica
        if (!nome || !endereco || !cnpj) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos: nome, endereço, cnpj.' });
        }
        
        const sql = `INSERT INTO condominios (nome, endereco, cnpj, valor_servico, recebe_nota_fiscal, contrato_digital, status, sindico, email_sindico, telefone_sindico, vencimento_boleto, transporte_tipo, transporte_onibus_detalhes, valor_inss) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            nome, endereco, cnpj,
            outrosCampos.valor_servico || null,
            outrosCampos.recebe_nota_fiscal || false,
            outrosCampos.contrato_digital || null,
            outrosCampos.status || 'Ativo',
            outrosCampos.sindico || null,
            outrosCampos.email_sindico || null,
            outrosCampos.telefone_sindico || null,
            outrosCampos.vencimento_boleto || null,
            outrosCampos.transporte_tipo || null,
            JSON.stringify(outrosCampos.transporte_onibus_detalhes || {}),
            outrosCampos.valor_inss || null
        ];

        const [result] = await dbPool.execute(sql, values);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar condomínio: ' + error.message });
    }
});

// PUT (atualizar) um condomínio
app.put('/api/condominios/:id', async (req, res) => {
    try {
        const { nome, endereco, cnpj, ...outrosCampos } = req.body;
        const sql = `UPDATE condominios SET nome = ?, endereco = ?, cnpj = ?, valor_servico = ?, recebe_nota_fiscal = ?, contrato_digital = ?, status = ?, sindico = ?, email_sindico = ?, telefone_sindico = ?, vencimento_boleto = ?, transporte_tipo = ?, transporte_onibus_detalhes = ?, valor_inss = ? WHERE id = ?`;
        const values = [
            nome, endereco, cnpj,
            outrosCampos.valor_servico,
            outrosCampos.recebe_nota_fiscal,
            outrosCampos.contrato_digital,
            outrosCampos.status,
            outrosCampos.sindico,
            outrosCampos.email_sindico,
            outrosCampos.telefone_sindico,
            outrosCampos.vencimento_boleto,
            outrosCampos.transporte_tipo,
            JSON.stringify(outrosCampos.transporte_onibus_detalhes || {}),
            outrosCampos.valor_inss,
            req.params.id
        ];
        
        const [result] = await dbPool.execute(sql, values);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Condomínio não encontrado.' });
        res.json({ message: 'Condomínio atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar condomínio: ' + error.message });
    }
});

// DELETE um condomínio
app.delete('/api/condominios/:id', async (req, res) => {
    try {
        const [result] = await dbPool.execute('DELETE FROM condominios WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Condomínio não encontrado.' });
        res.status(204).send(); // 204 No Content
    } catch (error) {
        // Tratar erro de chave estrangeira
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'Não é possível excluir o condomínio pois ele está associado a outros registros (escalas, documentos, etc.).' });
        }
        res.status(500).json({ error: 'Erro ao deletar condomínio: ' + error.message });
    }
});


/*
 * =================================================================
 * CRUD para a tabela 'funcionarias'
 * =================================================================
 */
const funcionariasJsonFields = ['dias_da_semana', 'documentos', 'cpfs_filhos'];

// GET todas as funcionárias
app.get('/api/funcionarias', async (req, res) => {
    try {
        const [rows] = await dbPool.execute('SELECT * FROM funcionarias ORDER BY nome');
        const funcionarias = rows.map(f => parseJsonFields(f, funcionariasJsonFields));
        res.json(funcionarias);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar funcionárias: ' + error.message });
    }
});

// GET uma funcionária por ID
app.get('/api/funcionarias/:id', async (req, res) => {
    try {
        const [rows] = await dbPool.execute('SELECT * FROM funcionarias WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Funcionária não encontrada.' });
        const funcionaria = parseJsonFields(rows[0], funcionariasJsonFields);
        res.json(funcionaria);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar funcionária: ' + error.message });
    }
});


// POST (criar) uma nova funcionária
app.post('/api/funcionarias', async (req, res) => {
    try {
        const { nome, cpf, telefone, endereco, salario_base, valor_passagem, passagens_mensais, ...outrosCampos } = req.body;
        if (!nome || !cpf || !telefone || !endereco || !salario_base || !valor_passagem || !passagens_mensais) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
        }
        
        const sql = `INSERT INTO funcionarias (nome, cpf, telefone, endereco, jornada_dias, horas_semanais, dias_da_semana, salario_base, valor_passagem, documentos, status, salario_mensal, passagens_mensais, rg, pis, titulo_eleitor, cpfs_filhos, data_de_admissao, data_de_desligamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            nome, cpf, telefone, endereco,
            outrosCampos.jornada_dias || null,
            outrosCampos.horas_semanais || null,
            JSON.stringify(outrosCampos.dias_da_semana || []),
            salario_base, valor_passagem,
            JSON.stringify(outrosCampos.documentos || []),
            outrosCampos.status || 'Ativa',
            outrosCampos.salario_mensal || null,
            passagens_mensais,
            outrosCampos.rg || null,
            outrosCampos.pis || null,
            outrosCampos.titulo_eleitor || null,
            JSON.stringify(outrosCampos.cpfs_filhos || []),
            outrosCampos.data_de_admissao || null,
            outrosCampos.data_de_desligamento || null
        ];

        const [result] = await dbPool.execute(sql, values);
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar funcionária: ' + error.message });
    }
});

// PUT (atualizar) uma funcionária
app.put('/api/funcionarias/:id', async (req, res) => {
    try {
        const { nome, cpf, telefone, endereco, salario_base, valor_passagem, passagens_mensais, ...outrosCampos } = req.body;
        const sql = `UPDATE funcionarias SET nome = ?, cpf = ?, telefone = ?, endereco = ?, jornada_dias = ?, horas_semanais = ?, dias_da_semana = ?, salario_base = ?, valor_passagem = ?, documentos = ?, status = ?, salario_mensal = ?, passagens_mensais = ?, rg = ?, pis = ?, titulo_eleitor = ?, cpfs_filhos = ?, data_de_admissao = ?, data_de_desligamento = ? WHERE id = ?`;
        const values = [
            nome, cpf, telefone, endereco,
            outrosCampos.jornada_dias,
            outrosCampos.horas_semanais,
            JSON.stringify(outrosCampos.dias_da_semana || []),
            salario_base, valor_passagem,
            JSON.stringify(outrosCampos.documentos || []),
            outrosCampos.status,
            outrosCampos.salario_mensal,
            passagens_mensais,
            outrosCampos.rg,
            outrosCampos.pis,
            outrosCampos.titulo_eleitor,
            JSON.stringify(outrosCampos.cpfs_filhos || []),
            outrosCampos.data_de_admissao,
            outrosCampos.data_de_desligamento,
            req.params.id
        ];
        
        const [result] = await dbPool.execute(sql, values);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Funcionária não encontrada.' });
        res.json({ message: 'Funcionária atualizada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar funcionária: ' + error.message });
    }
});

// DELETE uma funcionária
app.delete('/api/funcionarias/:id', async (req, res) => {
    try {
        const [result] = await dbPool.execute('DELETE FROM funcionarias WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Funcionária não encontrada.' });
        res.status(204).send();
    } catch (error) {
         if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'Não é possível excluir a funcionária pois ela está associada a outros registros (faltas, salários, etc.).' });
        }
        res.status(500).json({ error: 'Erro ao deletar funcionária: ' + error.message });
    }
});


/*
 * =================================================================
 * CRUD para as demais tabelas (documentos, escalas, faltas, etc.)
 * =================================================================
 */

// Função genérica para criar rotas CRUD para uma tabela
function createCrudRoutes(tableName, jsonFields = []) {
    const router = express.Router();

    // GET all
    router.get('/', async (req, res) => {
        try {
            const [rows] = await dbPool.execute(`SELECT * FROM ${tableName}`);
            const items = rows.map(item => parseJsonFields(item, jsonFields));
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: `Erro ao buscar ${tableName}: ${error.message}` });
        }
    });

    // GET by ID
    router.get('/:id', async (req, res) => {
         try {
            const [rows] = await dbPool.execute(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Item não encontrado.' });
            const item = parseJsonFields(rows[0], jsonFields)
            res.json(item);
        } catch (error) {
            res.status(500).json({ error: `Erro ao buscar item de ${tableName}: ${error.message}` });
        }
    });
    
    // POST
    router.post('/', async (req, res) => {
        try {
            const columns = Object.keys(req.body);
            const values = Object.values(req.body).map((val, index) => 
                jsonFields.includes(columns[index]) ? JSON.stringify(val || (Array.isArray(val) ? [] : {})) : val
            );
            const placeholders = columns.map(() => '?').join(', ');
            const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            
            const [result] = await dbPool.execute(sql, values);
            res.status(201).json({ id: result.insertId, ...req.body });
        } catch (error) {
            res.status(500).json({ error: `Erro ao criar item em ${tableName}: ${error.message}` });
        }
    });

    // PUT
    router.put('/:id', async (req, res) => {
        try {
            const columns = Object.keys(req.body);
            const setClauses = columns.map(col => `${col} = ?`).join(', ');
            const values = Object.values(req.body).map((val, index) => 
                jsonFields.includes(columns[index]) ? JSON.stringify(val || (Array.isArray(val) ? [] : {})) : val
            );
            values.push(req.params.id);

            const sql = `UPDATE ${tableName} SET ${setClauses} WHERE id = ?`;
            
            const [result] = await dbPool.execute(sql, values);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Item não encontrado.' });
            res.json({ message: `Item em ${tableName} atualizado com sucesso!` });
        } catch (error) {
            res.status(500).json({ error: `Erro ao atualizar item em ${tableName}: ${error.message}` });
        }
    });

    // DELETE
    router.delete('/:id', async (req, res) => {
        try {
            const [result] = await dbPool.execute(`DELETE FROM ${tableName} WHERE id = ?`, [req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Item não encontrado.' });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: `Erro ao deletar item em ${tableName}: ${error.message}` });
        }
    });

    return router;
}

// Usando a função genérica para criar as rotas para as outras tabelas
app.use('/api/documentos', createCrudRoutes('documentos'));
app.use('/api/escalas', createCrudRoutes('escalas'));
app.use('/api/faltas', createCrudRoutes('faltas'));
app.use('/api/salarios', createCrudRoutes('salarios'));
app.use('/api/usuarios', createCrudRoutes('usuarios'));
app.use('/api/relatorios', createCrudRoutes('relatorios', ['dados_json']));


// --- Inicialização do Servidor ---
app.listen(port, () => {
    console.log(`Backend rodando na porta http://localhost:${port}`);
    console.log('Use CTRL+C para parar o servidor.');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});
