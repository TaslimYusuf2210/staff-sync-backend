/**
 * Migration: Remove `degree` column from the Education table.
 *
 * The `degree` field was removed from the Education model in favour of
 * just `qualification` (which stores abbreviations like "B.Sc.", "RN", "HND").
 * Existing `degree` values have been concatenated into `qualification` where
 * they held useful data.
 *
 * Run: node scripts/migrate-drop-degree-from-education.js
 */
const { sequelize, testConnection } = require('../src/config/database');
require('../src/models');

const migrate = async () => {
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot run migration: database not connected.');
    process.exit(1);
  }

  const queryInterface = sequelize.getQueryInterface();

  // Check if the column exists before trying to drop it
  const tableInfo = await queryInterface.describeTable('education');
  if (tableInfo.degree) {
    await queryInterface.removeColumn('education', 'degree');
    console.log('✅ Dropped `degree` column from education table.');
  } else {
    console.log('ℹ️  `degree` column does not exist — already migrated.');
  }

  await sequelize.close();
  console.log('✅ Migration complete.');
  process.exit(0);
};

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
