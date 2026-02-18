import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testAppPayload() {
    console.log('--- TESTE: SIMULANDO PAYLOAD DO APP ---');

    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

    const supabaseUrl = urlMatch[1].trim();
    const anonKey = keyMatch[1].trim();

    // Payload idêntico ao gerado no handleSave do Personnel.tsx
    const appPayload = {
        id: Date.now().toString(),
        name: 'Ximenes App',
        full_name: 'Francisco Ximenes de Oliveira',
        rank: 'Sd PM',
        cadre: 'QOPPM',
        role: 'Motorista',
        role_short: '(M)',
        sector: 'Geral',
        team: 'ALFA',
        status: 'Ativo',
        matricula: '123456',
        mf: '987.654',
        phone: '85999999999',
        available_for_extra: true,
        order_extra: 10
    };

    console.log('Enviando payload...');

    try {
        const res = await fetch(`${supabaseUrl}/rest/v1/soldiers`, {
            method: 'POST',
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(appPayload)
        });

        if (res.ok) {
            const data = await res.json();
            console.log('✅ SALVAMENTO COM PAYLOAD DO APP OK!');
            console.log('Resposta:', data);
        } else {
            const text = await res.text();
            console.log('❌ ERRO NO SALVAMENTO:', text);
        }
    } catch (error) {
        console.log('❌ ERRO:', error.message);
    }
}

testAppPayload();
