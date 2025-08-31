import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://peymlauukfmvbzjfllub.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleW1sYXV1a2ZtdmJ6amZsbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDAzMTUsImV4cCI6MjA3MjIxNjMxNX0.bNh0-DXE1YV2VAVDkbnt4zxKyih_QtzEYrYyUFpdTRU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)