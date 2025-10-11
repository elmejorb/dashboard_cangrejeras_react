// Script para migrar las jugadoras a Firestore
// Ejecutar este script UNA VEZ para poblar la base de datos

import { collection, doc, setDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../config/firebase';

// Jugadoras del roster actual
const playersToMigrate = [
  {
    id: 1,
    name: 'Natalia',
    lastName: 'Valentín',
    jerseyNumber: '8',
    position: 'Opuesta',
    height: '1.88m',
    hometown: 'San Juan, PR'
  },
  {
    id: 2,
    name: 'Stephanie',
    lastName: 'Enright',
    jerseyNumber: '10',
    position: 'Central',
    height: '1.93m',
    hometown: 'Bayamón, PR'
  },
  {
    id: 3,
    name: 'Shirley',
    lastName: 'Ferrer',
    jerseyNumber: '7',
    position: 'Líbero',
    height: '1.65m',
    hometown: 'Ponce, PR'
  },
  {
    id: 4,
    name: 'Diana',
    lastName: 'Reyes',
    jerseyNumber: '12',
    position: 'Punta',
    height: '1.78m',
    hometown: 'Carolina, PR'
  },
  {
    id: 5,
    name: 'Karina',
    lastName: 'Ocasio',
    jerseyNumber: '15',
    position: 'Punta',
    height: '1.80m',
    hometown: 'Caguas, PR'
  },
  {
    id: 6,
    name: 'Daly',
    lastName: 'Santana',
    jerseyNumber: '3',
    position: 'Levantadora',
    height: '1.75m',
    hometown: 'Mayagüez, PR'
  },
  {
    id: 7,
    name: 'María José',
    lastName: 'Pérez',
    jerseyNumber: '9',
    position: 'Central',
    height: '1.90m',
    hometown: 'Arecibo, PR'
  },
  {
    id: 8,
    name: 'Valeria',
    lastName: 'Rivera',
    jerseyNumber: '11',
    position: 'Opuesta',
    height: '1.85m',
    hometown: 'Guaynabo, PR'
  },
  {
    id: 9,
    name: 'Alejandra',
    lastName: 'Torres',
    jerseyNumber: '14',
    position: 'Punta',
    height: '1.77m',
    hometown: 'Humacao, PR'
  },
  {
    id: 10,
    name: 'Sofía',
    lastName: 'Burgos',
    jerseyNumber: '6',
    position: 'Levantadora',
    height: '1.72m',
    hometown: 'San Germán, PR'
  },
  {
    id: 11,
    name: 'Isabella',
    lastName: 'Martínez',
    jerseyNumber: '4',
    position: 'Líbero',
    height: '1.63m',
    hometown: 'Fajardo, PR'
  },
  {
    id: 12,
    name: 'Camila',
    lastName: 'Rosado',
    jerseyNumber: '13',
    position: 'Central',
    height: '1.92m',
    hometown: 'Aguadilla, PR'
  },
  {
    id: 13,
    name: 'Andrea',
    lastName: 'Morales',
    jerseyNumber: '2',
    position: 'Punta',
    height: '1.79m',
    hometown: 'Vega Baja, PR'
  },
  {
    id: 14,
    name: 'Paola',
    lastName: 'Sánchez',
    jerseyNumber: '5',
    position: 'Opuesta',
    height: '1.86m',
    hometown: 'Cayey, PR'
  },
];

export const migratePlayersToFirestore = async (adminId: string) => {
  console.log('🚀 Iniciando migración de jugadoras a Firestore...');

  try {
    // Verificar si ya existen jugadoras en Firestore
    const playersRef = collection(db, 'players');
    const q = query(playersRef);
    const existingPlayers = await getDocs(q);

    if (existingPlayers.size > 0) {
      console.log(`⚠️ Ya existen ${existingPlayers.size} jugadoras en Firestore`);
      const shouldContinue = window.confirm(
        `Ya hay ${existingPlayers.size} jugadoras en Firestore. ¿Deseas continuar y agregar las que faltan?`
      );
      if (!shouldContinue) {
        console.log('❌ Migración cancelada por el usuario');
        return { success: false, message: 'Migración cancelada' };
      }
    }

    let created = 0;
    let skipped = 0;
    let errors = 0;

    // Migrar cada jugadora
    for (const player of playersToMigrate) {
      try {
        // Usar el ID numérico como ID del documento en Firestore
        const playerDocRef = doc(db, 'players', player.id.toString());

        // Verificar si ya existe
        const playerDoc = await getDocs(query(collection(db, 'players')));
        const exists = playerDoc.docs.some(doc => doc.id === player.id.toString());

        if (exists) {
          console.log(`⏭️ Jugadora ${player.name} ${player.lastName} (#${player.jerseyNumber}) ya existe`);
          skipped++;
          continue;
        }

        const playerData = {
          name: player.name,
          lastName: player.lastName,
          number: parseInt(player.jerseyNumber),
          position: player.position,
          height: player.height,
          points: 0,
          aces: 0,
          blocks: 0,
          status: 'active',
          photo: '',
          bio: `Jugadora de ${player.position} de ${player.hometown}`,
          gamesPlayed: 0,
          gamesWon: 0,
          avgPerGame: 0,
          attacks: 0,
          effectiveness: 0,
          team: 'Cangrejeras de Santurce',
          league: 'Liga de Voleibol Superior Femenino',
          season: '2024-2025',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: adminId,
          updatedBy: adminId
        };

        await setDoc(playerDocRef, playerData);

        console.log(`✅ Jugadora ${player.name} ${player.lastName} (#${player.jerseyNumber}) migrada exitosamente`);
        created++;
      } catch (error) {
        console.error(`❌ Error migrando jugadora ${player.name}:`, error);
        errors++;
      }
    }

    const summary = {
      success: true,
      created,
      skipped,
      errors,
      total: playersToMigrate.length,
      message: `✅ Migración completada: ${created} creadas, ${skipped} omitidas, ${errors} errores`
    };

    console.log('📊 Resumen de migración:', summary);
    return summary;
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return {
      success: false,
      message: 'Error en la migración: ' + (error as Error).message
    };
  }
};
