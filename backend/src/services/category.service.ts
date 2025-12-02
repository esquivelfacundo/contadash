import { prisma } from '../config/database'
import { CreateCategoryInput, UpdateCategoryInput } from '../validations/category.validation'
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors'

export async function getCategories(userId: string, type?: 'INCOME' | 'EXPENSE') {
  const where: any = { userId }
  
  if (type) {
    where.type = type
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: [
      { isDefault: 'desc' },
      { name: 'asc' },
    ],
  })

  return categories
}

export async function getCategoryById(userId: string, id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
  })

  if (!category) {
    throw new NotFoundError('Category not found')
  }

  if (category.userId !== userId) {
    throw new ForbiddenError('Access denied')
  }

  return category
}

export async function createCategory(userId: string, data: CreateCategoryInput) {
  // Check if category with same name and type already exists
  const existing = await prisma.category.findUnique({
    where: {
      userId_name_type: {
        userId,
        name: data.name,
        type: data.type,
      },
    },
  })

  if (existing) {
    throw new ConflictError('Category with this name and type already exists')
  }

  const category = await prisma.category.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      color: data.color,
      icon: data.icon,
      isDefault: false,
    },
  })

  return category
}

export async function updateCategory(
  userId: string,
  id: string,
  data: UpdateCategoryInput
) {
  // Verify category exists and belongs to user
  const existing = await getCategoryById(userId, id)

  // Don't allow updating default categories
  if (existing.isDefault) {
    throw new ForbiddenError('Cannot update default categories')
  }

  // Check name conflict if name is being updated
  if (data.name && data.name !== existing.name) {
    const conflict = await prisma.category.findUnique({
      where: {
        userId_name_type: {
          userId,
          name: data.name,
          type: existing.type,
        },
      },
    })

    if (conflict) {
      throw new ConflictError('Category with this name already exists')
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data,
  })

  return category
}

export async function deleteCategory(userId: string, id: string) {
  // Verify category exists and belongs to user
  const existing = await getCategoryById(userId, id)

  // Don't allow deleting default categories
  if (existing.isDefault) {
    throw new ForbiddenError('Cannot delete default categories')
  }

  // Check if category has transactions
  const transactionCount = await prisma.transaction.count({
    where: { categoryId: id },
  })

  if (transactionCount > 0) {
    throw new ConflictError(
      `Cannot delete category with ${transactionCount} transactions. Please reassign or delete them first.`
    )
  }

  await prisma.category.delete({
    where: { id },
  })

  return { message: 'Category deleted successfully' }
}
