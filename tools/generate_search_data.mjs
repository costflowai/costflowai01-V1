#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Calculator data for search
const calculators = [
    {
        id: 'concrete',
        title: 'Concrete Calculator',
        description: 'Calculate concrete costs for slabs, footings, and foundations',
        url: '/calculators/concrete/',
        category: 'Concrete',
        keywords: ['concrete', 'cement', 'slab', 'foundation', 'footing']
    },
    {
        id: 'concrete-footing',
        title: 'Concrete Footing Calculator',
        description: 'Calculate concrete footing and foundation costs',
        url: '/calculators/concrete-footing/',
        category: 'Concrete',
        keywords: ['footing', 'foundation', 'concrete', 'basement', 'pier']
    },
    {
        id: 'concrete-driveway',
        title: 'Concrete Driveway Calculator',
        description: 'Calculate concrete driveway installation costs',
        url: '/calculators/concrete-driveway/',
        category: 'Concrete',
        keywords: ['driveway', 'concrete', 'paving', 'vehicle', 'entrance']
    },
    {
        id: 'concrete-deck',
        title: 'Concrete Deck Calculator',
        description: 'Calculate concrete deck and patio costs',
        url: '/calculators/concrete-deck/',
        category: 'Concrete',
        keywords: ['deck', 'patio', 'concrete', 'outdoor', 'entertainment']
    },
    {
        id: 'concrete-stamped',
        title: 'Stamped Concrete Calculator',
        description: 'Calculate decorative stamped concrete costs',
        url: '/calculators/concrete-stamped/',
        category: 'Concrete',
        keywords: ['stamped', 'decorative', 'concrete', 'pattern', 'texture']
    },
    {
        id: 'concrete-slab',
        title: 'Concrete Slab Calculator',
        description: 'Calculate concrete slab costs for floors and foundations',
        url: '/calculators/concrete-slab/',
        category: 'Concrete',
        keywords: ['slab', 'concrete', 'floor', 'foundation', 'base']
    },
    {
        id: 'insulation',
        title: 'Insulation Calculator',
        description: 'Calculate insulation material and installation costs',
        url: '/calculators/insulation/',
        category: 'Energy',
        keywords: ['insulation', 'energy', 'thermal', 'fiberglass', 'foam']
    },
    {
        id: 'flooring',
        title: 'Flooring Calculator',
        description: 'Calculate flooring material and installation costs',
        url: '/calculators/flooring/',
        category: 'Interior',
        keywords: ['flooring', 'hardwood', 'laminate', 'tile', 'carpet']
    },
    {
        id: 'roofing',
        title: 'Roofing Calculator',
        description: 'Calculate roofing material and labor costs',
        url: '/calculators/roofing/',
        category: 'Exterior',
        keywords: ['roofing', 'shingles', 'metal', 'tiles', 'repair']
    },
    {
        id: 'siding',
        title: 'Siding Calculator',
        description: 'Calculate siding material and installation costs',
        url: '/calculators/siding/',
        category: 'Exterior',
        keywords: ['siding', 'vinyl', 'wood', 'fiber cement', 'exterior']
    },
    {
        id: 'framing',
        title: 'Framing Calculator',
        description: 'Calculate lumber and framing costs',
        url: '/calculators/framing/',
        category: 'Structure',
        keywords: ['framing', 'lumber', 'studs', 'joists', 'structure']
    },
    {
        id: 'drywall',
        title: 'Drywall Calculator',
        description: 'Calculate drywall material and installation costs',
        url: '/calculators/drywall/',
        category: 'Interior',
        keywords: ['drywall', 'sheetrock', 'gypsum', 'walls', 'ceiling']
    },
    {
        id: 'painting',
        title: 'Painting Calculator',
        description: 'Calculate paint and labor costs for interior and exterior',
        url: '/calculators/painting/',
        category: 'Finishing',
        keywords: ['painting', 'paint', 'primer', 'interior', 'exterior']
    },
    {
        id: 'excavation',
        title: 'Excavation Calculator',
        description: 'Calculate excavation and earthwork costs',
        url: '/calculators/excavation/',
        category: 'Site Work',
        keywords: ['excavation', 'earthwork', 'digging', 'grading', 'soil']
    },
    {
        id: 'fence',
        title: 'Fence Calculator',
        description: 'Calculate fencing material and installation costs',
        url: '/calculators/fence/',
        category: 'Exterior',
        keywords: ['fence', 'privacy', 'chain link', 'wood', 'vinyl']
    },
    {
        id: 'deck',
        title: 'Deck Calculator',
        description: 'Calculate deck building and material costs',
        url: '/calculators/deck/',
        category: 'Exterior',
        keywords: ['deck', 'outdoor', 'wood', 'composite', 'railing']
    },
    {
        id: 'hvac',
        title: 'HVAC Calculator',
        description: 'Calculate heating and cooling system costs',
        url: '/calculators/hvac/',
        category: 'HVAC',
        keywords: ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace']
    },
    {
        id: 'electrical',
        title: 'Electrical Calculator',
        description: 'Calculate electrical work and wiring costs',
        url: '/calculators/electrical/',
        category: 'Electrical',
        keywords: ['electrical', 'wiring', 'outlets', 'circuit', 'breaker']
    },
    {
        id: 'plumbing',
        title: 'Plumbing Calculator',
        description: 'Calculate plumbing installation and repair costs',
        url: '/calculators/plumbing/',
        category: 'Plumbing',
        keywords: ['plumbing', 'pipes', 'fixtures', 'water', 'drain']
    },
    {
        id: 'windows',
        title: 'Windows Calculator',
        description: 'Calculate window replacement and installation costs',
        url: '/calculators/windows/',
        category: 'Exterior',
        keywords: ['windows', 'replacement', 'installation', 'glass', 'frame']
    },
    {
        id: 'doors',
        title: 'Doors Calculator',
        description: 'Calculate door installation and replacement costs',
        url: '/calculators/doors/',
        category: 'Interior',
        keywords: ['doors', 'installation', 'replacement', 'interior', 'exterior']
    }
];

// Blog posts data for search
const blogPosts = [
    {
        id: 'construction-cost-estimation-guide',
        title: 'Complete Guide to Construction Cost Estimation',
        description: 'Learn the fundamentals of accurate construction cost estimation including methods, tools, and best practices.',
        url: '/blog/construction-cost-estimation-guide/',
        category: 'Guides',
        keywords: ['estimation', 'cost', 'construction', 'guide', 'planning']
    },
    {
        id: 'material-cost-fluctuations',
        title: 'Understanding Material Cost Fluctuations in Construction',
        description: 'How material price changes affect your construction budget and strategies to manage cost volatility.',
        url: '/blog/material-cost-fluctuations/',
        category: 'Market Analysis',
        keywords: ['materials', 'pricing', 'fluctuations', 'budget', 'market']
    },
    {
        id: 'labor-cost-calculations',
        title: 'Accurate Labor Cost Calculations for Construction Projects',
        description: 'Methods and formulas for calculating labor costs including overhead, benefits, and regional variations.',
        url: '/blog/labor-cost-calculations/',
        category: 'Labor',
        keywords: ['labor', 'costs', 'calculations', 'wages', 'overhead']
    },
    {
        id: 'regional-pricing-variations',
        title: 'Regional Pricing Variations in Construction Costs',
        description: 'Understanding how location affects construction costs and adjusting estimates for different markets.',
        url: '/blog/regional-pricing-variations/',
        category: 'Market Analysis',
        keywords: ['regional', 'pricing', 'location', 'market', 'variations']
    }
];

// Main pages data for search
const pages = [
    {
        id: 'home',
        title: 'CostFlowAI - Professional Construction Cost Estimation',
        description: 'Professional construction cost estimation platform with accurate calculators for materials, labor, and project planning.',
        url: '/',
        category: 'Main',
        keywords: ['costflowai', 'construction', 'estimation', 'calculators', 'home']
    },
    {
        id: 'calculators',
        title: 'Construction Cost Calculators',
        description: 'Comprehensive collection of construction cost calculators for all project types and trades.',
        url: '/calculators/',
        category: 'Tools',
        keywords: ['calculators', 'tools', 'construction', 'cost', 'estimation']
    },
    {
        id: 'blog',
        title: 'Construction Cost Blog',
        description: 'Expert insights, guides, and analysis on construction cost estimation and industry trends.',
        url: '/blog/',
        category: 'Content',
        keywords: ['blog', 'articles', 'guides', 'insights', 'construction']
    },
    {
        id: 'contact',
        title: 'Contact CostFlowAI',
        description: 'Get in touch with CostFlowAI for support, feedback, or questions about our construction calculators.',
        url: '/contact/',
        category: 'Support',
        keywords: ['contact', 'support', 'help', 'feedback', 'questions']
    }
];

// Combine all search data and format for search.js
const allItems = [...pages, ...calculators, ...blogPosts];

// Transform to expected search format
const searchData = {
    count: allItems.length,
    items: allItems.map(item => ({
        title: item.title,
        content: item.description, // Use description as content
        excerpt: item.description,
        url: item.url,
        category: item.category,
        tags: item.keywords || []
    }))
};

// Generate search index
console.log('Generating search data...');

try {
    // Ensure assets/data directory exists
    const dataDir = path.join(projectRoot, 'assets', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write search data
    const searchFilePath = path.join(dataDir, 'search.json');
    fs.writeFileSync(searchFilePath, JSON.stringify(searchData, null, 2));

    console.log(`✅ Search data generated: ${searchFilePath}`);
    console.log(`📊 Total searchable items: ${searchData.count}`);
    console.log(`   - Pages: ${pages.length}`);
    console.log(`   - Calculators: ${calculators.length}`);
    console.log(`   - Blog posts: ${blogPosts.length}`);

} catch (error) {
    console.error('❌ Error generating search data:', error);
    process.exit(1);
}