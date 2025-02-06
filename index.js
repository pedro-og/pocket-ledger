const { Client, LocalAuth } = require('whatsapp-web.js');
const { google } = require('googleapis');
const qrcode = require('qrcode-terminal');

// Configuração do WhatsApp bot
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
});

// Configuração da autenticação do Google Sheets
async function setupSheets() {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]
    });

    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    return sheets;
}

// Função para definir permissões de edição na planilha
async function setSheetPermissions(sheetId) {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        const drive = google.drive({ version: 'v3', auth: await auth.getClient() }); // Use v3 (mais estável)

        await drive.permissions.create({
            fileId: sheetId,
            requestBody: {
                role: 'writer',
                type: 'anyone',
            },
        });

        console.log(`✅ Permissões de edição concedidas para a planilha ${sheetId}`);
    } catch (err) {
        console.error('❌ Erro ao definir permissões:', err.message, err.stack); // Adicione o stack trace
    }
}

// ID da planilha principal que contém os usuários e seus IDs de planilhas
const USERS_SHEET_ID = '1hhVk1sNp98_9eQufNstl48zSS7zZy429vt8WiLbR-WM'; // Substitua pelo ID correto
const USERS_SHEET_RANGE = 'Users!A:B'; // Coluna A = Número, Coluna B = ID da planilha do usuário

// Função para verificar se um usuário já tem planilha
async function getUserSheetId(sender) {
    try {
        const sheets = await setupSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: USERS_SHEET_ID,
            range: USERS_SHEET_RANGE
        });

        const rows = response.data.values || [];
        for (let row of rows) {
            if (row[0] === sender) {
                return row[1]; // Retorna o ID da planilha se o usuário já estiver cadastrado
            }
        }
        return null;
    } catch (err) {
        console.error('❌ Erro ao buscar usuário:', err.message);
        return null;
    }
}

// Função para criar uma nova planilha para o usuário
async function createUserSheet(sender) {
    try {
        const sheets = await setupSheets();
        const response = await sheets.spreadsheets.create({
            resource: {
                properties: { title: `Planilha Financeira` }
            }
        });

        const newSheetId = response.data.spreadsheetId;

        // Definir permissões de edição para todos com o link
        await setSheetPermissions(newSheetId);

        // Salvar o ID na planilha principal
        await sheets.spreadsheets.values.append({
            spreadsheetId: USERS_SHEET_ID,
            range: USERS_SHEET_RANGE,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [[sender, newSheetId]] }
        });

        console.log(`✅ Criada planilha para ${sender}: ${newSheetId}`);
        return newSheetId;
    } catch (err) {
        console.error('❌ Erro ao criar planilha:', err.message);
        return null;
    }
}

// Função para adicionar dados à planilha do usuário
async function addToUserSheet(sheetId, amount, category, date) {
    try {
        const sheets = await setupSheets();
        const range = 'Sheet1!A:C';

        const values = [[date.toLocaleDateString('pt-BR'), amount, category]];

        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

        console.log(`✅ ${amount} reais na categoria ${category} adicionados na planilha ${sheetId}`);
    } catch (err) {
        console.error('❌ Erro ao adicionar à planilha do usuário:', err.message);
    }
}

// Gera o QR Code para login no WhatsApp
client.on('qr', qr => qrcode.generate(qr, { small: true }));

// Confirma que o bot está pronto
client.on('ready', () => console.log('🤖 Bot do WhatsApp está pronto!'));

// Lê mensagens recebidas
let isCreatingSheet = false;

client.on('message', async (msg) => {
    const sender = msg.from;
    const text = msg.body.toLowerCase();
    const regex = /^(\d+)\s*reais?\s+(.+)/;
    const match = text.match(regex);

    try {
        // Checa se o usuário já tem uma planilha cadastrada
        let userSheetId = await getUserSheetId(sender);

        if (!userSheetId && !isCreatingSheet) {
            isCreatingSheet = true; // Evita a criação duplicada de planilhas
            // Criar uma nova planilha se não existir
            userSheetId = await createUserSheet(sender);
            if (!userSheetId) {
                await msg.reply('❌ Erro ao criar sua planilha.');
                return;
            }
            const sheetUrl = `https://docs.google.com/spreadsheets/d/${userSheetId}`;
            await msg.reply(`
            ✅ *Planilha criada!*  
            Agora você pode começar a fazer seu controle financeiro. Para adicionar transações, basta usar o formato:  
                
            \`10 reais mercado\`.
                
            Acesse sua planilha através deste link: [${sheetUrl}].
                
            🔒 *Atenção*: Qualquer pessoa com esse link terá acesso completo para visualização e edição.  
            Por favor, tome cuidado com o compartilhamento!
            `);

            isCreatingSheet = false; // Libera para futuras criações
            return;
        }

        // Se o usuário já tem planilha, processa a inserção de dados
        if (match) {
            const amount = parseFloat(match[1]);
            const category = match[2];

            await addToUserSheet(userSheetId, amount, category, new Date());
            await msg.reply(`✅ ${amount} reais na categoria *${category}* adicionados à sua planilha!`);
        } else {
            await msg.reply('❌ Formato inválido. Exemplo correto: "10 reais comida"');
        }
    } catch (err) {
        console.error('❌ Erro no processamento:', err.message);
        await msg.reply('❌ Ocorreu um erro. Tente novamente.');
    }
});


// Inicializa o bot
client.initialize();
