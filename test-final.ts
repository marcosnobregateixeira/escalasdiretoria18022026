import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wiuryqhvwhbfhkuljipj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpdXJ5cWh2d2hiZmhrdWxqaXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzY2NTIsImV4cCI6MjA4NjMxMjY1Mn0.v9HK216B191de0UrAWP0qqtHdY-G27yhu5zSGlGVJBg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFinal() {
    console.log('--- TESTE FINAL SUPABASE ---');
    const testId = 'final_test_' + Date.now();

    // Test Write
    const { error: insertError } = await supabase
        .from('soldiers')
        .insert([
            {
                id: testId,
                name: 'TESTE FINAL SISTEMA',
                rank: 'SD',
                cadre: 'QOPPM',
                sector: 'TI',
                role: 'Teste',
                role_short: 'T',
                status: 'ATIVO'
            }
        ]);

    if (insertError) {
        console.error('❌ ERRO NO TESTE DE ESCRITA:', insertError.message);
    } else {
        console.log('✅ SUCESSO NO TESTE DE ESCRITA!');

        // Test Read
        const { data, error: readError } = await supabase
            .from('soldiers')
            .select('name')
            .eq('id', testId)
            .single();

        if (readError) {
            console.error('❌ ERRO NO TESTE DE LEITURA:', readError.message);
        } else {
            console.log('✅ SUCESSO NO TESTE DE LEITURA! Nome recuperado:', data.name);

            // Cleanup
            await supabase.from('soldiers').delete().eq('id', testId);
            console.log('🗑️ Registro de teste removido.');
        }
    }
}

testFinal();
