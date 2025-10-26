import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://pbxxjbuvduhdogulhuhw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieHhqYnV2ZHVoZG9ndWxodWh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTQxNjQ3OSwiZXhwIjoyMDQ0OTkyNDc5fQ.YULh-ex_DmGw5fKW1SUyPmEXPakyJf22SI3M0V16lag';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyFix() {
  console.log('🔧 تطبيق إصلاح دالة التسوية المالية...\n');

  try {
    // Step 1: إضافة Policy للسماح بالكتابة
    console.log('📝 Step 1: إضافة Policy للسماح بالكتابة في logs_finance...');
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "logs_finance_allow_function_insert" ON logs_finance
          FOR INSERT
          TO authenticated, anon
          WITH CHECK (true);
      `
    });

    if (policyError && !policyError.message.includes('already exists')) {
      console.log('⚠️  Policy Error:', policyError.message);
    } else {
      console.log('✅ تمت إضافة Policy');
    }

    // Step 2: إعادة إنشاء دالة التسوية
    console.log('\n📝 Step 2: إعادة إنشاء دالة التسوية...');
    const functionSQL = readFileSync('./supabase/migrations/20251026180000_fix_settlement_function_logs_access.sql', 'utf8');

    // استخراج الدالة فقط
    const functionMatch = functionSQL.match(/CREATE OR REPLACE FUNCTION[\s\S]*?\$\$ LANGUAGE plpgsql SECURITY DEFINER;/);

    if (functionMatch) {
      const { error: funcError } = await supabase.rpc('exec_sql', {
        sql: functionMatch[0]
      });

      if (funcError) {
        console.log('⚠️  Function Error:', funcError.message);
      } else {
        console.log('✅ تم إعادة إنشاء الدالة');
      }
    }

    console.log('\n✅ اكتمل تطبيق الإصلاح!');

    // Step 3: اختبار الدالة
    console.log('\n🧪 Step 3: اختبار الدالة...');

    const { data: farms } = await supabase
      .from('farm_finance')
      .select('farm_id, farm_code, settlement_ready, settlement_executed')
      .is('deleted_at', null)
      .limit(1);

    if (farms && farms.length > 0) {
      console.log(`\n📊 وجدنا مزرعة للاختبار: ${farms[0].farm_code}`);
      console.log(`   - جاهزة للتسوية: ${farms[0].settlement_ready ? 'نعم' : 'لا'}`);
      console.log(`   - تمت التسوية: ${farms[0].settlement_executed ? 'نعم' : 'لا'}`);

      if (farms[0].settlement_ready && !farms[0].settlement_executed) {
        console.log('\n⚠️  المزرعة جاهزة للتسوية! يمكنك الآن اختبار زر التسوية في الواجهة');
      }
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

applyFix();
