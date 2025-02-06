const { google } = require('googleapis');
const fs = require('fs');

async function setupSheets() {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json', // Certifique-se de que este arquivo está na mesma pasta do seu script
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    return sheets;
}

// Teste: Escrever e ler dados
async function testGoogleSheets() {
    try {
        const sheets = await setupSheets();
        const spreadsheetId = '1hhVk1sNp98_9eQufNstl48zSS7zZy429vt8WiLbR-WM'; // Substitua pelo ID da sua planilha
        const range = 'TestSheet!A1:B2'; // Altere para o nome da sua aba/intervalo

        // Escrever dados
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    ['Data', 'Valor'],
                    [new Date().toLocaleDateString(), '10.50'],
                ],
            },
        });
        console.log('✅ Dados escritos com sucesso!');

        // Ler dados
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        console.log('📊 Dados lidos:', response.data.values);

    } catch (err) {
        console.error('❌ Erro:', err.message);
    }
}

// Executar o teste
testGoogleSheets();