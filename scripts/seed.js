const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Clean up existing users to avoid duplicates if re-run (optional, for dev)
  // await prisma.user.deleteMany({})

  const solicitante = await prisma.user.create({
    data: {
      name: 'Juan Perez (Solicitante)',
      role: 'SOLICITANTE',
    },
  })
  const testeador = await prisma.user.create({
    data: {
      name: 'Ana Lopez (Testeador)',
      role: 'TESTEADOR',
    },
  })
  console.log({ solicitante, testeador })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
