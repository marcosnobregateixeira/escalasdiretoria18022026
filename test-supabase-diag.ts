import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wiuryqhvwhbfhkuljipj.supabase.co';
const supabaseAnonKey = 'sb_publishable_9TQ4PUEIHC967EEYOIjagw_rq3sbH_f';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log('--- Testando Supabase INSERT ---');
    const { data, error } = await supabase
        .from('soldiers')
        .insert([
            { id: 'test_diag_' + Date.now(), name: 'Teste Diagnóstico', rank: 'SD', sector: 'Teste', role: 'Teste', role_short: 'T', status: 'ATIVO' }
        ]);

    if (error) {
        console.error('❌ Erro na escrita:', error.message, error.details, error.hint);
    } else {
        console.log('✅ Escrita realizada com sucesso!');
    }
}

test();
