import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'adrbrag18@gmail.com'
  const senhaPlana = 'André180416@'

  const senhaHash = await bcrypt.hash(senhaPlana, 12)

  await prisma.usuario.upsert({
    where: { email },
    update: {
      nome: 'André Bragança',
      senhaHash,
      role: 'ADM',
      ativo: true,
    },
    create: {
      nome: 'André Bragança',
      email,
      senhaHash,
      role: 'ADM',
      ativo: true,
    },
  })

  console.log('✅ Admin Máximo criado/atualizado com sucesso:', email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
