import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Credenciais não encontradas no ambiente');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log('--- Testando Supabase com chaves do ambiente ---');
    console.log('URL:', supabaseUrl);

    const { data: selectData, error: selectError } = await supabase
        .from('soldiers')
        .select('id')
        .limit(1);

    if (selectError) {
        console.error('❌ Erro na leitura:', selectError.message);
    } else {
        console.log('✅ Leitura realizada com sucesso!');
    }

    const { error: insertError } = await supabase
        .from('soldiers')
        .insert([
            { id: 'env_test_' + Date.now(), name: 'Teste Env', rank: 'SD', sector: 'Teste', role: 'Teste', role_short: 'T', status: 'ATIVO' }
        ]);

    if (insertError) {
        console.error('❌ Erro na escrita:', insertError.message);
    } else {
        console.log('✅ Escrita realizada com sucesso!');
    }
}

test();
