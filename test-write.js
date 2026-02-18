
import fs from 'fs';
import path from 'path';

async function testWrite() {
    console.log('--- TESTE ESCRITA FIREBASE REST ---');

    const apiKey = 'AIzaSyApxB38LT9-VsnOAe1cQe1S1bXwC96jb10';
    const projectId = 'escalas2026-e20c9';

    const docPath = 'soldiers/test_rest_id';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docPath}?key=${apiKey}`;

    const payload = {
        fields: {
            name: { stringValue: 'Teste REST' },
            timestamp: { stringValue: new Date().toISOString() }
        }
    };

    try {
        const response = await fetch(url + '&updateMask.fieldPaths=name&updateMask.fieldPaths=timestamp', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ ESCRITA REST OK!');
            console.log('Documento criado/atualizado:', data.name);
        } else {
            console.log('❌ ERRO NA ESCRITA REST:');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('❌ ERRO DE REDE:', error.message);
    }
}

testWrite();
