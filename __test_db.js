const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()
const USER_ID = 'cmou15dnq0000ib046yndoljw' // bolshiyanov@gmail.com

async function main() {
  const updated = await db.serverToken.updateMany({
    where: { userId: USER_ID, stripeCheckoutSessionId: 'cs_test_a1wESsoODow01cX4q8bxB3kk4CSzgqVCi8qS1fzwOzm6K7wUbkkuI1Op0H' },
    data: {
      status: 'active',
      subdomain: 'test-active.fractera.ai',
    },
  })
  console.log('Updated:', updated.count, 'record(s) → status: active')
}
main().finally(() => db.$disconnect())
