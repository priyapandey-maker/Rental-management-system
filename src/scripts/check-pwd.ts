import bcrypt from 'bcrypt';

async function run() {
  const match = await bcrypt.compare('DemoPassword123!', '$2b$10$eLUEm0/0ilAyuACml79ojeS7qo0GnmX/0od8RFLqTits6ALQ3A7GC');
  console.log("Matches:", match);
}

run();
