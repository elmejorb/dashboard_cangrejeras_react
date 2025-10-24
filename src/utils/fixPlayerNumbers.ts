import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Script de utilidad para diagnosticar y corregir jugadoras con number: 0
 *
 * IMPORTANTE: Este script debe ejecutarse desde la consola del navegador
 * cuando estés logueado como admin en el Dashboard
 */

export const diagnosePlayerNumbers = async () => {
  console.log('🔍 Diagnosticando números de jugadoras...\n');

  try {
    const playersRef = collection(db, 'players');
    const snapshot = await getDocs(playersRef);

    const allPlayers: any[] = [];
    const activePlayers: any[] = [];
    const inactivePlayers: any[] = [];
    const playersWithZero: any[] = [];
    const playersWithValidNumber: any[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const player = {
        id: doc.id,
        name: data.name,
        lastName: data.lastName,
        number: data.number,
        status: data.status
      };

      allPlayers.push(player);

      if (data.status === 'active') {
        activePlayers.push(player);
      } else {
        inactivePlayers.push(player);
      }

      if (!data.number || data.number === 0) {
        playersWithZero.push(player);
      } else {
        playersWithValidNumber.push(player);
      }
    });

    console.log('📊 RESUMEN GENERAL:');
    console.log('━'.repeat(60));
    console.log(`Total de jugadoras: ${allPlayers.length}`);
    console.log(`  ✅ Activas: ${activePlayers.length}`);
    console.log(`  ⏸️  Inactivas: ${inactivePlayers.length}`);
    console.log(`  ✅ Con número válido: ${playersWithValidNumber.length}`);
    console.log(`  ❌ Con number = 0: ${playersWithZero.length}`);
    console.log('');

    if (playersWithZero.length > 0) {
      console.log('❌ JUGADORAS CON NUMBER = 0:');
      console.log('━'.repeat(60));
      playersWithZero.forEach(p => {
        console.log(`  - ${p.name} ${p.lastName} (${p.status})`);
        console.log(`    ID: ${p.id}`);
        console.log(`    number: ${p.number}`);
        console.log('');
      });
    }

    if (playersWithValidNumber.length > 0) {
      console.log('✅ JUGADORAS CON NÚMERO VÁLIDO:');
      console.log('━'.repeat(60));
      playersWithValidNumber.forEach(p => {
        console.log(`  - #${p.number} ${p.name} ${p.lastName} (${p.status})`);
      });
      console.log('');
    }

    console.log('📋 JUGADORAS ACTIVAS (las que se usan en votaciones):');
    console.log('━'.repeat(60));
    activePlayers.forEach(p => {
      const status = p.number && p.number > 0 ? '✅' : '❌';
      console.log(`  ${status} #${p.number || 0} ${p.name} ${p.lastName}`);
    });
    console.log('');

    if (playersWithZero.length > 0) {
      console.log('⚠️ ACCIÓN REQUERIDA:');
      console.log('━'.repeat(60));
      console.log('Debes asignar números de camiseta a estas jugadoras:');
      console.log('');
      console.log('Opción 1: Manualmente en Firebase Console');
      console.log('  → Firestore Database → players → editar cada documento');
      console.log('');
      console.log('Opción 2: Usar la función de corrección automática');
      console.log('  → Ejecuta: fixPlayerNumbers(mapping)');
      console.log('');
      console.log('Ejemplo de mapping:');
      console.log('  const mapping = {');
      playersWithZero.slice(0, 3).forEach(p => {
        console.log(`    "${p.id}": 5,  // ${p.name} ${p.lastName}`);
      });
      console.log('  };');
      console.log('  await fixPlayerNumbers(mapping);');
    } else {
      console.log('✅ ¡TODAS LAS JUGADORAS TIENEN NÚMEROS VÁLIDOS!');
    }

    return {
      total: allPlayers.length,
      active: activePlayers.length,
      withZero: playersWithZero.length,
      withValidNumber: playersWithValidNumber.length,
      playersWithZero,
      activePlayers
    };
  } catch (error) {
    console.error('❌ Error diagnosticando jugadoras:', error);
    throw error;
  }
};

/**
 * Corrige los números de las jugadoras según el mapping proporcionado
 *
 * @param mapping - Objeto con ID de jugadora → número de camiseta
 *
 * @example
 * const mapping = {
 *   "abc123": 5,   // Debora Seilhamer → #5
 *   "def456": 10,  // Maria Torres → #10
 *   "ghi789": 23   // Ana Rodriguez → #23
 * };
 * await fixPlayerNumbers(mapping);
 */
export const fixPlayerNumbers = async (mapping: Record<string, number>) => {
  console.log('🔧 Corrigiendo números de jugadoras...\n');

  const updates: Promise<void>[] = [];
  const results: { id: string; number: number; success: boolean; error?: any }[] = [];

  for (const [playerId, newNumber] of Object.entries(mapping)) {
    console.log(`📝 Actualizando jugadora ${playerId} → #${newNumber}`);

    const updatePromise = updateDoc(doc(db, 'players', playerId), {
      number: newNumber,
      updatedAt: new Date()
    })
      .then(() => {
        results.push({ id: playerId, number: newNumber, success: true });
        console.log(`  ✅ ${playerId} → #${newNumber}`);
      })
      .catch(error => {
        results.push({ id: playerId, number: newNumber, success: false, error });
        console.error(`  ❌ Error en ${playerId}:`, error.message);
      });

    updates.push(updatePromise);
  }

  await Promise.all(updates);

  console.log('\n📊 RESUMEN DE ACTUALIZACIÓN:');
  console.log('━'.repeat(60));
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✅ Exitosas: ${successful}`);
  console.log(`❌ Fallidas: ${failed}`);
  console.log('');

  if (failed > 0) {
    console.log('❌ Actualizaciones fallidas:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.id}: ${r.error?.message || 'Error desconocido'}`);
    });
    console.log('');
  }

  console.log('✅ ¡Corrección completada!');
  console.log('');
  console.log('📋 SIGUIENTE PASO:');
  console.log('  1. Elimina las votaciones con playerId: 0');
  console.log('  2. Crea un nuevo partido');
  console.log('  3. La votación se creará con los números correctos');

  return results;
};

/**
 * Asigna números secuenciales automáticamente a jugadoras sin número
 * CUIDADO: Esto asignará números arbitrarios (1, 2, 3, 4, ...)
 * Solo úsalo si no te importan los números específicos
 */
export const autoAssignNumbers = async (startFrom: number = 1) => {
  console.log(`🤖 Asignando números automáticos desde #${startFrom}...\n`);

  const playersRef = collection(db, 'players');
  const snapshot = await getDocs(playersRef);

  const playersWithZero: any[] = [];
  const usedNumbers = new Set<number>();

  // Primero, recopilar jugadoras sin número y números ya usados
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.number && data.number > 0) {
      usedNumbers.add(data.number);
    } else {
      playersWithZero.push({
        id: doc.id,
        name: data.name,
        lastName: data.lastName
      });
    }
  });

  console.log(`Números ya en uso: ${Array.from(usedNumbers).sort((a, b) => a - b).join(', ')}`);
  console.log(`Jugadoras sin número: ${playersWithZero.length}\n`);

  // Encontrar números disponibles
  let currentNumber = startFrom;
  const mapping: Record<string, number> = {};

  for (const player of playersWithZero) {
    // Encontrar el siguiente número disponible
    while (usedNumbers.has(currentNumber)) {
      currentNumber++;
    }

    mapping[player.id] = currentNumber;
    usedNumbers.add(currentNumber);
    console.log(`${player.name} ${player.lastName} → #${currentNumber}`);
    currentNumber++;
  }

  console.log('\n⚠️ ¿Continuar con esta asignación automática?');
  console.log('Para confirmar, ejecuta:');
  console.log('  await fixPlayerNumbers(mapping);\n');
  console.log('Donde mapping = ');
  console.log(JSON.stringify(mapping, null, 2));

  return mapping;
};

// Exportar funciones globales para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).diagnosePlayerNumbers = diagnosePlayerNumbers;
  (window as any).fixPlayerNumbers = fixPlayerNumbers;
  (window as any).autoAssignNumbers = autoAssignNumbers;
}
