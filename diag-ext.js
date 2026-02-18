import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function diagnostic() {
    console.log('--- DIAGNÓSTICO SUPABASE REST (ESM) ---');

    const envPath = path.join(__dirname, '.env.local');
    console.log(`Lendo: ${envPath}`);

    if (!fs.existsSync(envPath)) {
        console.log('❌ Arquivo .env.local não encontrado!');
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

    if (!urlMatch || !keyMatch) {
        console.log('❌ Chaves Supabase não encontradas no .env.local!');
        return;
    }

    const supabaseUrl = urlMatch[1].trim();
    const anonKey = keyMatch[1].trim();

    console.log(`Testando URL: ${supabaseUrl}`);

    const url = `${supabaseUrl}/rest/v1/soldiers?select=count`;

    try {
        const response = await fetch(url, {
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ CONEXÃO REST SUPABASE OK!');
            console.log('Resposta:', data);
        } else {
            const text = await response.text();
            console.log('❌ ERRO NA API REST SUPABASE:');
            console.log(text);
        }
    } catch (error) {
        console.log('❌ ERRO DE REDE:', error.message);
    }
}

diagnostic();
