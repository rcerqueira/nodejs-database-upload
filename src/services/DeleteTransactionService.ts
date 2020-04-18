import { getCustomRepository, getRepository } from 'typeorm';
import { isUuid } from 'uuidv4';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (!isUuid(id)) {
      throw new AppError('Invalid transaction ID.', 400);
    }

    const transaction = await transactionsRepository.findOne(id);

    if (!transaction) {
      throw new AppError('Transaction not found', 400);
    }

    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
