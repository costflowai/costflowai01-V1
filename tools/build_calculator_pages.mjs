#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Configuration
const config = {
  registryPath: path.join(projectRoot, 'assets/js/calculators/registry.js'),
  templatePath: path.join(projectRoot, 'templates/calc_page.html'),
  outputDir: path.join(projectRoot, 'calculators'),
  baseUrl: 'https://costflowai.com'
};

/**
 * Read the calculator registry to get available calculators
 */
async function getCalculatorRegistry() {
  try {
    // Read the registry file
    const registryContent = fs.readFileSync(config.registryPath, 'utf-8');

    // Extract calculator entries using regex
    const registryMatch = registryContent.match(/export const calculatorRegistry = \[([\s\S]*?)\];/);
    if (!registryMatch) {
      throw new Error('Could not find calculatorRegistry in registry.js');
    }

    // Parse calculator entries
    const calculators = [];
    const calculatorMatches = registryMatch[1].matchAll(/\{[\s\S]*?id: ['"`](\w+)['"`][\s\S]*?description: ['"`](.*?)['"`][\s\S]*?\}/g);

    for (const match of calculatorMatches) {
      const [, id, description] = match;
      calculators.push({
        id: id.trim(),
        description: description.trim()
      });
    }

    return calculators;
  } catch (error) {
    console.error('Failed to read calculator registry:', error);
    throw error;
  }
}

/**
 * Load the calculator page template
 */
function loadTemplate() {
  try {
    return fs.readFileSync(config.templatePath, 'utf-8');
  } catch (error) {
    console.error('Failed to load template:', error);
    throw error;
  }
}

/**
 * Render template with calculator data
 */
function renderTemplate(template, calculator) {
  const titleCase = calculator.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  const title = titleCase.includes('Calculator') ? titleCase : `${titleCase} Calculator`;

  return template
    .replace(/\{\{title\}\}/g, title)
    .replace(/\{\{description\}\}/g, calculator.description)
    .replace(/\{\{calculator_id\}\}/g, calculator.id)
    .replace(/\{\{nonce\}\}/g, 'PLACEHOLDER_NONCE'); // Will be replaced by nonce injection
}

/**
 * Generate individual calculator pages
 */
function generateCalculatorPages(calculators, template) {
  let generatedCount = 0;

  calculators.forEach(calculator => {
    const calculatorDir = path.join(config.outputDir, calculator.id);
    const outputPath = path.join(calculatorDir, 'index.html');

    // Ensure directory exists
    if (!fs.existsSync(calculatorDir)) {
      fs.mkdirSync(calculatorDir, { recursive: true });
    }

    // Render and write the page
    const html = renderTemplate(template, calculator);
    fs.writeFileSync(outputPath, html);

    console.log(`Generated: calculators/${calculator.id}/index.html`);
    generatedCount++;
  });

  return generatedCount;
}

/**
 * Main build function
 */
async function buildCalculatorPages() {
  console.log('Building calculator pages...');

  try {
    // Get calculator registry
    console.log('Reading calculator registry...');
    const calculators = await getCalculatorRegistry();
    console.log(`Found ${calculators.length} calculators`);

    // Load template
    console.log('Loading template...');
    const template = loadTemplate();

    // Generate pages
    console.log('Generating calculator pages...');
    const generatedCount = generateCalculatorPages(calculators, template);

    console.log(`✅ Calculator pages build completed successfully!`);
    console.log(`📁 Generated ${generatedCount} calculator pages`);

  } catch (error) {
    console.error('❌ Calculator pages build failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('build_calculator_pages.mjs')) {
  buildCalculatorPages();
}

export { buildCalculatorPages };