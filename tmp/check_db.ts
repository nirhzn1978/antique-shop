import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  const { data, error } = await supabase
    .from('shop_settings')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching settings:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('Current columns in shop_settings:', Object.keys(data[0]))
  } else {
    console.log('No data found in shop_settings to infer columns.')
  }
}

checkSchema()
