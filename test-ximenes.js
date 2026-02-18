import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testXimenes() {
    console.log('--- TESTE REAL: ADICIONANDO XIMENES NO SUPABASE ---');

    const envPath = path.join(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) {
        console.log('❌ Arquivo .env.local não encontrado!');
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

    if (!urlMatch || !keyMatch) {
        console.log('❌ Chaves Supabase não encontradas!');
        return;
    }

    const supabaseUrl = urlMatch[1].trim();
    const anonKey = keyMatch[1].trim();

    const ximenes = {
        id: 'test-' + Date.now(),
        name: 'Ximenes',
        rank: 'Sd PM',
        role: 'Motorista',
        role_short: '(M)',
        sector: 'Geral',
        status: 'Ativo'
    };

    console.log('Tentando inserir Ximenes...');

    try {
        // 1. INSERIR
        const insertRes = await fetch(`${supabaseUrl}/rest/v1/soldiers`, {
            method: 'POST',
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(ximenes)
        });

        if (insertRes.ok) {
            console.log('✅ Ximenes adicionado com SUCESSO!');

            // 2. VERIFICAR LEITURA
            console.log('Verificando se Ximenes aparece na lista...');
            const readRes = await fetch(`${supabaseUrl}/rest/v1/soldiers?name=eq.Ximenes`, {
                headers: {
                    'apikey': anonKey,
                    'Authorization': `Bearer ${anonKey}`
                }
            });
            const data = await readRes.json();

            if (data.length > 0) {
                console.log('🔍 RESULTADO DA BUSCA:', data[0]);
                console.log('--- TESTE CONCLUÍDO COM 100% DE SUCESSO ---');
            } else {
                console.log('❌ Erro: Ximenes inserido mas não encontrado na busca.');
            }
        } else {
            const err = await insertRes.text();
            console.log('❌ Erro ao inserir:', err);
        }
    } catch (e) {
        console.log('❌ Erro de rede:', e.message);
    }
}

testXimenes();
