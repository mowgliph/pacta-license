#!/usr/bin/env node
import { Command } from 'commander';
import { LicenseGenerator } from './license-generator';
import { join } from 'path';

const program = new Command();

program
  .version('1.0.0')
  .description('Generador de licencias para PACTA')
  .requiredOption('-c, --company <nombre>', 'Nombre de la empresa')
  .requiredOption('-n, --name <nombre>', 'Nombre del contacto')
  .requiredOption('-e, --email <email>', 'Email de contacto')
  .option('-t, --type <tipo>', 'Tipo de licencia (trial/full)', 'full')
  .option('-o, --output <directorio>', 'Directorio de salida', join(process.cwd(), 'licencias-generadas'));

program.parse(process.argv);

async function main() {
  const options = program.opts();
  const generator = new LicenseGenerator(options.output);
  
  try {
    const { licPath, pdfPath } = await generator.generate(
      options.company,
      options.name,
      options.email,
      options.type
    );

    console.log('✅ Licencia generada exitosamente:');
    console.log(`- Archivo de licencia: ${licPath}`);
    console.log(`- Documento PDF: ${pdfPath}`);
  } catch (error) {
    console.error('❌ Error generando la licencia:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();