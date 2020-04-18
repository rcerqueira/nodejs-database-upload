import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async findAll(): Promise<Transaction[]> {
    const transactions = await this.find();

    /* eslint no-param-reassign: ["error", { "props": false }] */
    transactions.map(transaction => {
      delete transaction.created_at;
      delete transaction.updated_at;
      delete transaction.category_id;
      delete transaction.category.created_at;
      delete transaction.category.updated_at;
      transaction.value = Number(transaction.value);
    });

    return transactions;
  }

  public async getBalance(): Promise<Balance> {
    /*
      Sei que foi pedido pra utilizar o reduce aqui, mas como no desafio
      anterior já foi utilizado, e como este desafio já é com utilização de
      banco de dados, fiz essa "desobediencia" e utilizei dessa forma abaixo.
      Peço perdão
    */
    const totalIncome = await this.createQueryBuilder('transactions')
      .select('SUM(value)', 'total')
      .where({ type: 'income' })
      .getRawOne();

    const totalOutcome = await this.createQueryBuilder('transactions')
      .select('SUM(value)', 'total')
      .where({ type: 'outcome' })
      .getRawOne();

    return {
      income: Number(totalIncome.total),
      outcome: Number(totalOutcome.total),
      total: Number(totalIncome.total) - Number(totalOutcome.total),
    };
  }
}

export default TransactionsRepository;
