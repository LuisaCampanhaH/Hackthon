const express = require('express');
const db = require('./config/db'); // Puxa conexão com o pgAdmin

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 1. ROTA PRINCIPAL DE TESTE
app.get('/', (req, res) => {
  res.send('API do Dispenser de Remédios Rodando! 💊');
});

// 2. NOVA ROTA: BUSCAR AGENDA DO DISPOSITIVO
app.get('/api/dispositivo/:id/agenda', async (req, res) => {
  // Pegamos o ID que veio na URL (ex: ESP32_SALA_01)
  const idDispositivo = req.params.id; 

  try {
   
    const querySQL = 'SELECT * FROM horarios_medicamentos WHERE id_dispositivo = $1';
    
    // Executa a query passando o ID do dispositivo no lugar do $1 (proteção contra invasões)
    const resultado = await db.query(querySQL, [idDispositivo]);

    // Respondemos para o Frontend com o JSON contendo as linhas (rows) do banco
    return res.status(200).json(resultado.rows);

  } catch (error) {
    console.error('Erro ao buscar agenda:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar dados no banco.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// 3. ROTA: CADASTRAR UM NOVO HORÁRIO DE MEDICAMENTO (POST)
app.post('/api/medicamentos/agendar', async (req, res) => {
  // Desestruturação: pegamos cada campo que o Frontend vai nos enviar dentro do req.body
  const {
    id_dispositivo,
    nome_remedio,
    dosagem,
    horario,
    segunda, terca, quarta, quinta, sexta, sabado, domingo
  } = req.body;

  // Validação básica: ID do dispositivo, nome do remédio e horário são obrigatórios
  if (!id_dispositivo || !nome_remedio || !horario) {
    return res.status(400).json({ erro: 'id_dispositivo, nome_remedio e horario são obrigatórios!' });
  }

  try {
    // A query SQL de INSERT com os placeholders ($1, $2...) por segurança
    const querySQL = `
      INSERT INTO horarios_medicamentos 
      (id_dispositivo, nome_remedio, dosagem, horario, segunda, terca, quarta, quinta, sexta, sabado, domingo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *; 
    `; // O 'RETURNING *' faz o Postgres devolver o dado que ele acabou de criar com o ID gerado

    const valores = [
      id_dispositivo,
      nome_remedio,
      dosagem,
      horario,
      segunda ?? true, // Se o front não mandar o dia, assume true usando o operador ??
      terca ?? true,
      quarta ?? true,
      quinta ?? true,
      sexta ?? true,
      sabado ?? true,
      domingo ?? true
    ];

    const resultado = await db.query(querySQL, valores);

    // Retorna o status 201 (Created) e o objeto que foi salvo no banco
    return res.status(201).json({
      mensagem: 'Medicamento cadastrado com sucesso! 💊',
      dados: resultado.rows[0]
    });

  } catch (error) {
    console.error('Erro ao cadastrado medicamento:', error);
    return res.status(500).json({ erro: 'Erro interno ao salvar no banco de dados.' });
  }
});