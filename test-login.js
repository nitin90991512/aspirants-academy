const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wmwvykikwkcqrzozkqdq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtd3Z5a2lrd2tjcXJ6b3prcWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MDMwODgsImV4cCI6MjA5Mzk3OTA4OH0.6Rf-egQcAI7SghrDMOYy7lsJea4-uzpW9C9fp-9q3uQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'teacher1@aspirants.com',
    password: 'password123',
  });
  console.log("Data:", data);
  console.log("Error:", error);
}

testLogin();
