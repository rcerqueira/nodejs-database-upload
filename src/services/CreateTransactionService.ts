import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (!['income', 'outcome'].includes(type))
      throw new AppError("Type must contain 'income' or 'outcome'", 400);

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (
      type === 'outcome' &&
      (await transactionsRepository.getBalance()).total < value
    )
      throw new AppError('There is not enough balance for this operation', 400);

    let categoryId: string;

    const findCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!findCategory) {
      const categoryData = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryData);

      categoryId = categoryData.id;
    } else categoryId = findCategory.id;

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryId,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
