#!/usr/bin/env node
/**
 * Schema.org JSON-LD Validator for CostFlowAI
 * Validates structured data across all pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class SchemaValidator {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.errors = [];
    this.warnings = [];
    this.validSchemas = [];
  }

  async validatePage(url) {
    console.log(`Validating schema for: ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.errors.push({
          url,
          error: `HTTP ${response.status}: ${response.statusText}`
        });
        return;
      }

      const html = await response.text();
      const schemas = this.extractSchemas(html, url);

      for (const schema of schemas) {
        await this.validateSchema(schema, url);
      }

    } catch (error) {
      this.errors.push({
        url,
        error: `Fetch error: ${error.message}`
      });
    }
  }

  extractSchemas(html, url) {
    const schemas = [];
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
    let match;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonContent = match[1].trim();
        const schema = JSON.parse(jsonContent);
        schemas.push({
          url,
          content: schema,
          raw: jsonContent
        });
      } catch (parseError) {
        this.errors.push({
          url,
          error: `JSON parse error: ${parseError.message}`,
          schema: match[1].substring(0, 200) + '...'
        });
      }
    }

    return schemas;
  }

  async validateSchema(schema, url) {
    const content = schema.content;

    // Check @context
    if (!content['@context']) {
      this.errors.push({
        url,
        error: 'Missing @context property',
        schema: JSON.stringify(content, null, 2).substring(0, 200) + '...'
      });
      return;
    }

    if (content['@context'] !== 'https://schema.org') {
      this.warnings.push({
        url,
        warning: `Non-standard @context: ${content['@context']}`,
        schema: content['@type']
      });
    }

    // Check @type
    if (!content['@type']) {
      this.errors.push({
        url,
        error: 'Missing @type property',
        schema: JSON.stringify(content, null, 2).substring(0, 200) + '...'
      });
      return;
    }

    // Validate specific schema types
    switch (content['@type']) {
      case 'WebSite':
        this.validateWebSite(content, url);
        break;
      case 'WebApplication':
        this.validateWebApplication(content, url);
        break;
      case 'BlogPosting':
        this.validateBlogPosting(content, url);
        break;
      case 'WebPage':
        this.validateWebPage(content, url);
        break;
      case 'SoftwareApplication':
        this.validateSoftwareApplication(content, url);
        break;
      default:
        this.warnings.push({
          url,
          warning: `Unknown schema type: ${content['@type']}`,
          schema: content['@type']
        });
    }

    this.validSchemas.push({
      url,
      type: content['@type'],
      valid: true
    });
  }

  validateWebSite(schema, url) {
    const required = ['name', 'url'];
    const recommended = ['description', 'publisher'];

    for (const field of required) {
      if (!schema[field]) {
        this.errors.push({
          url,
          error: `WebSite missing required field: ${field}`,
          schema: 'WebSite'
        });
      }
    }

    for (const field of recommended) {
      if (!schema[field]) {
        this.warnings.push({
          url,
          warning: `WebSite missing recommended field: ${field}`,
          schema: 'WebSite'
        });
      }
    }

    // Validate URL format
    if (schema.url && !schema.url.startsWith('http')) {
      this.errors.push({
        url,
        error: 'WebSite url must be absolute URL',
        schema: 'WebSite'
      });
    }
  }

  validateWebApplication(schema, url) {
    const required = ['name', 'url', 'applicationCategory'];
    const recommended = ['description', 'operatingSystem', 'offers'];

    for (const field of required) {
      if (!schema[field]) {
        this.errors.push({
          url,
          error: `WebApplication missing required field: ${field}`,
          schema: 'WebApplication'
        });
      }
    }

    for (const field of recommended) {
      if (!schema[field]) {
        this.warnings.push({
          url,
          warning: `WebApplication missing recommended field: ${field}`,
          schema: 'WebApplication'
        });
      }
    }
  }

  validateBlogPosting(schema, url) {
    const required = ['headline', 'author', 'datePublished'];
    const recommended = ['description', 'image', 'publisher', 'dateModified'];

    for (const field of required) {
      if (!schema[field]) {
        this.errors.push({
          url,
          error: `BlogPosting missing required field: ${field}`,
          schema: 'BlogPosting'
        });
      }
    }

    for (const field of recommended) {
      if (!schema[field]) {
        this.warnings.push({
          url,
          warning: `BlogPosting missing recommended field: ${field}`,
          schema: 'BlogPosting'
        });
      }
    }

    // Validate date formats
    if (schema.datePublished && !this.isValidISODate(schema.datePublished)) {
      this.errors.push({
        url,
        error: 'datePublished must be valid ISO date',
        schema: 'BlogPosting'
      });
    }

    if (schema.dateModified && !this.isValidISODate(schema.dateModified)) {
      this.errors.push({
        url,
        error: 'dateModified must be valid ISO date',
        schema: 'BlogPosting'
      });
    }
  }

  validateWebPage(schema, url) {
    const required = ['name', 'url'];
    const recommended = ['description', 'breadcrumb'];

    for (const field of required) {
      if (!schema[field]) {
        this.errors.push({
          url,
          error: `WebPage missing required field: ${field}`,
          schema: 'WebPage'
        });
      }
    }

    for (const field of recommended) {
      if (!schema[field]) {
        this.warnings.push({
          url,
          warning: `WebPage missing recommended field: ${field}`,
          schema: 'WebPage'
        });
      }
    }
  }

  validateSoftwareApplication(schema, url) {
    const required = ['name', 'applicationCategory'];
    const recommended = ['description', 'operatingSystem', 'offers', 'author'];

    for (const field of required) {
      if (!schema[field]) {
        this.errors.push({
          url,
          error: `SoftwareApplication missing required field: ${field}`,
          schema: 'SoftwareApplication'
        });
      }
    }

    for (const field of recommended) {
      if (!schema[field]) {
        this.warnings.push({
          url,
          warning: `SoftwareApplication missing recommended field: ${field}`,
          schema: 'SoftwareApplication'
        });
      }
    }
  }

  isValidISODate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) &&
           dateString.match(/^\d{4}-\d{2}-\d{2}/) !== null;
  }

  async validateAllPages() {
    // Key pages to validate
    const pages = [
      `${this.baseUrl}/`,
      `${this.baseUrl}/calculators/`,
      `${this.baseUrl}/blog/`,
      `${this.baseUrl}/contact/`
    ];

    // Add calculator pages
    const calculators = [
      'concrete', 'framing', 'drywall', 'paint', 'roofing', 'flooring',
      'plumbing', 'electrical', 'hvac', 'earthwork', 'masonry', 'steel'
    ];

    calculators.forEach(calc => {
      pages.push(`${this.baseUrl}/calculators/${calc}/`);
    });

    // Add sample blog posts
    pages.push(`${this.baseUrl}/blog/welcome-to-costflowai/`);
    pages.push(`${this.baseUrl}/blog/concrete-calculator-guide/`);

    for (const url of pages) {
      await this.validatePage(url);
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalPages: this.validSchemas.length + this.errors.length,
        validSchemas: this.validSchemas.length,
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      errors: this.errors,
      warnings: this.warnings,
      validSchemas: this.validSchemas
    };

    console.log('\\n=== SCHEMA VALIDATION REPORT ===');
    console.log(`Total pages checked: ${report.summary.totalPages}`);
    console.log(`Valid schemas: ${report.summary.validSchemas}`);
    console.log(`Errors: ${report.summary.errors}`);
    console.log(`Warnings: ${report.summary.warnings}`);

    if (this.errors.length > 0) {
      console.log('\\n❌ SCHEMA ERRORS:');
      this.errors.forEach(error => {
        console.log(`  ${error.url}: ${error.error}`);
        if (error.schema && typeof error.schema === 'string' && error.schema.length < 100) {
          console.log(`    Schema: ${error.schema}`);
        }
      });
    }

    if (this.warnings.length > 0) {
      console.log('\\n⚠️  SCHEMA WARNINGS:');
      this.warnings.forEach(warning => {
        console.log(`  ${warning.url}: ${warning.warning}`);
      });
    }

    if (this.validSchemas.length > 0) {
      console.log('\\n✅ VALID SCHEMAS:');
      const schemaTypes = {};
      this.validSchemas.forEach(schema => {
        schemaTypes[schema.type] = (schemaTypes[schema.type] || 0) + 1;
      });
      Object.entries(schemaTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} pages`);
      });
    }

    return report;
  }

  async run() {
    console.log('🔍 Starting Schema.org validation...');
    console.log(`Base URL: ${this.baseUrl}`);

    try {
      await this.validateAllPages();
      const report = this.generateReport();

      // Save report
      const reportPath = path.join(projectRoot, 'docs/qa/schema-validation-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      if (this.errors.length > 0) {
        console.log(`\\n💾 Report saved to: ${reportPath}`);
        process.exit(1);
      } else {
        console.log('\\n✅ All schemas are valid!');
        process.exit(0);
      }

    } catch (error) {
      console.error('❌ Schema validation failed:', error);
      process.exit(1);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5000/');
    return response.ok;
  } catch {
    return false;
  }
}

// Run schema validation
async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Development server not running on localhost:5000');
    console.log('Please run: npm run dev');
    process.exit(1);
  }

  const validator = new SchemaValidator();
  await validator.run();
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

export default SchemaValidator;