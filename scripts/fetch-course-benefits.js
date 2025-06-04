// Script to fetch and print all course benefits data
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local if available
const fs = require('fs');
const path = require('path');

// Function to load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n');
      
      envVars.forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^['"](.*)['"]/g, '$1');
          process.env[key] = value;
        }
      });
      
      console.log('Loaded environment variables from .env.local');
    } else {
      console.log('No .env.local file found, using process.env directly');
    }
  } catch (error) {
    console.error('Error loading .env.local file:', error);
  }
}

// Load environment variables
loadEnvFile();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchCourseBenefits() {
  try {
    console.log('Fetching course benefits data...');
    
    // Fetch all course benefits
    const { data: courseBenefits, error } = await supabase
      .from('course_benefits')
      .select('*')
      .order('course_id, order');
    
    if (error) {
      throw error;
    }
    
    console.log('\n=== COURSE BENEFITS TABLE DATA ===\n');
    console.table(courseBenefits);
    console.log(`\nTotal records: ${courseBenefits.length}`);
    
    // Group by course_id
    const benefitsByCourseid = courseBenefits.reduce((acc, benefit) => {
      if (!acc[benefit.course_id]) {
        acc[benefit.course_id] = [];
      }
      acc[benefit.course_id].push(benefit);
      return acc;
    }, {});
    
    console.log('\n=== BENEFITS BY COURSE ID ===\n');
    for (const [courseId, benefits] of Object.entries(benefitsByCourseid)) {
      console.log(`\nCourse ID: ${courseId} (${benefits.length} benefits)`);
      console.table(benefits);
    }
    
  } catch (error) {
    console.error('Error fetching course benefits:', error);
  }
}

// Run the function
fetchCourseBenefits();
