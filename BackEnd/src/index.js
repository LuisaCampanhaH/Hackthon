const express = require('express');
const cors = require('cors'); // Importa o pacote para liberar o acesso ao Frontend
const db = require('./config/db'); 

const app = express();

app.use(cors()); // Ativa o CORS para evitar bloqueios no navegador do Frontend
app.use(express.json()); 

const PORT = process.env.PORT || 3000;


// FUNÇÃO AUXILIAR: SIMULADOR DE PUSH NOTIFICATION

function enviarNotificacaoPush(nomeCuidador, nomePaciente, nomeRemedio, status) {
  console.log('\n==================================================');
  console.log(`📱 [PUSH NOTIFICATION] Enviando alerta para: ${nomeCuidador}`);
  if (status === 'Atrasado') {
    console.log(`⚠️ ALERTA DE EMERGÊNCIA: ${nomePaciente} está atrasado(a) com o remédio: ${nomeRemedio}!`);
  } else {
    console.log(`✅ AVISO: ${nomePaciente} tomou o remédio: ${nomeRemedio} no prazo.`);
  }
  console.log('==================================================\n');
}


// ROTAS DA API


// 1. ROTA PRINCIPAL DE TESTE
app.get('/', (req, res) => {
  res.send('API do Dispenser de Remédios Rodando! 💊');
});

// 2. ROTA: BUSCAR AGENDA DO DISPOSITIVO (GET)
app.get('/api/dispositivo/:id/agenda', async (req, res) => {
  const idDispositivo = req.params.id; 
  try {
    const querySQL = 'SELECT * FROM horarios_medicamentos WHERE id_dispositivo = $1';
    const resultado = await db.query(querySQL, [idDispositivo]);
    return res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao buscar agenda:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar dados no banco.' });
  }
});

// 3. ROTA: CADASTRAR UM NOVO HORÁRIO DE MEDICAMENTO (POST)
app.post('/api/medicamentos/agendar', async (req, res) => {
  const {
    id_dispositivo, nome_remedio, dosagem, horario,
    segunda, terca, quarta, quinta, sexta, sabado, domingo
  } = req.body;

  if (!id_dispositivo || !nome_remedio || !horario) {
    return res.status(400).json({ erro: 'id_dispositivo, nome_remedio e horario são obrigatórios!' });
  }

  try {
    const querySQL = `
      INSERT INTO horarios_medicamentos 
      (id_dispositivo, nome_remedio, dosagem, horario, segunda, terca, quarta, quinta, sexta, sabado, domingo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *; 
    `;

    const valores = [
      id_dispositivo, nome_remedio, dosagem, horario,
      segunda ?? true, terca ?? true, quarta ?? true, quinta ?? true, sexta ?? true, sabado ?? true, domingo ?? true
    ];

    const resultado = await db.query(querySQL, valores);
    return res.status(201).json({
      mensagem: 'Medicamento cadastrado com sucesso! 💊',
      dados: resultado.rows[0]
    });
  } catch (error) {
    console.error('Erro ao cadastrar medicamento:', error);
    return res.status(500).json({ erro: 'Erro interno ao salvar no banco de dados.' });
  }
});

// 4. ROTA: CONFIRMAÇÃO DO ESP32 (REMEDIO TOMADO - POST)
app.post('/api/dispositivo/confirmacao', async (req, res) => {
  const { id_dispositivo, nome_remedio, horario_programado } = req.body;

  if (!id_dispositivo || !nome_remedio || !horario_programado) {
    return res.status(400).json({ erro: 'id_dispositivo, nome_remedio e horario_programado são obrigatórios!' });
  }

  try {
    const agora = new Date(); 
    const programado = new Date(horario_programado); 
    const diferencaEmMinutos = Math.abs(agora - programado) / (1000 * 60);

    let status = 'No Prazo';
    if (diferencaEmMinutos > 15) {
      status = 'Atrasado';
    }

    // 1. Salva a dose no histórico
    const querySQL = `
      INSERT INTO historico_doses (id_dispositivo, nome_remedio, horario_programado, horario_tomado, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    const valores = [id_dispositivo, nome_remedio, programado, agora, status];
    const resultado = await db.query(querySQL, valores);

    // 2. Busca o nome do paciente e do cuidador no banco para personalizar a notificação
    const queryDispositivo = 'SELECT nome_paciente, nome_cuidador FROM dispositivos WHERE id_dispositivo = $1';
    const dadosDispositivo = await db.query(queryDispositivo, [id_dispositivo]);
    
    // Se o dispositivo existir no banco, envia o Push simulado
    if (dadosDispositivo.rows.length > 0) {
      const { nome_cuidador, nome_paciente } = dadosDispositivo.rows[0];
      enviarNotificacaoPush(nome_cuidador, nome_paciente, nome_remedio, status);
    }

    return res.status(201).json({
      mensagem: 'Histórico registrado e cuidador notificado!',
      dados: resultado.rows[0]
    });
  } catch (error) {
    console.error('Erro ao confirmar dose:', error);
    return res.status(500).json({ erro: 'Erro interno ao salvar histórico.' });
  }
});

// 5. ROTA: BUSCAR HISTÓRICO DE DOSES PARA OS GRÁFICOS (GET)
app.get('/api/dispositivo/:id/historico', async (req, res) => {
  const idDispositivo = req.params.id;
  try {
    const querySQL = `
      SELECT id, nome_remedio, horario_programado, horario_tomado, status 
      FROM historico_doses 
      WHERE id_dispositivo = $1 
      ORDER BY horario_programado DESC;
    `;
    const resultado = await db.query(querySQL, [idDispositivo]);
    return res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar histórico no banco.' });
  }
});

// O LISTEN FICA SEMPRE NA ÚLTIMA LINHA DO ARQUIVO! 🏁
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});