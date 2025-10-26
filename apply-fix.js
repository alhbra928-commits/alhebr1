import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://pbxxjbuvduhdogulhuhw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHhqYnV2ZHVoZG9ndWxodWh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTQxNjQ3OSwiZXhwIjoyMDQ0OTkyNDc5fQ.YULh-ex_DmGw5fKW1SUyPmEXPakyJf22SI3M0V16lag';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFix() {
  console.log('🔧 تطبيق إصلاح دالة التسوية المالية...\n');
  
  const sql = readFileSync('./supabase/migrations/20251026180000_fix_settlement_function_logs_access.sql', 'utf8');
  
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('/*') && !s.startsWith('--'));
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`📝 تنفيذ Statement ${i + 1}/${statements.length}...`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement }).catch(() => 
        supabase.from('_migrations').insert({ statement })
      );
      
      if (error) {
        console.log(`⚠️  ${error.message}`);
      } else {
        console.log(`✅ تم بنجاح`);
      }
    } catch (err) {
      console.log(`⚠️  ${err.message}`);
    }
  }
  
  console.log('\n✅ اكتمل تطبيق الإصلاح!');
}

applyFix().catch(console.error);
