import { getRepository, getCustomRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';
import { parse, format } from 'fast-csv';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

import uploadConfig from '../config/upload';

interface TransactionCsvRow {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  private async addTransactions(
    data: TransactionCsvRow[],
  ): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const row of data) {
      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransaction.execute({
        title: row.title,
        value: row.value,
        type: row.type,
        category: row.category,
      });
      transactions.push(transaction);
    }
    /**
     * Tentei fazer esse laço usando o forEach, mas não entendi o motivo do mesmo
     * não conseguir retornar nada para a constante transaction.
     */

    // data.forEach(async row => {
    //   const transaction = await createTransaction.execute({
    //     title: row.title,
    //     value: row.value,
    //     type: row.type,
    //     category: row.category,
    //   });

    //   transactions.push(transaction);
    // });

    return transactions;
  }

  public async execute(csvFile: string): Promise<Transaction[]> {
    const csvFileFullPath = path.join(uploadConfig.directory, csvFile);
    const transactionsData: TransactionCsvRow[] = [];

    const csvStream = fs
      .createReadStream(csvFileFullPath)
      .pipe(parse({ delimiter: ',', headers: true, trim: true }))
      .on('data', row => transactionsData.push(row));
    await new Promise(resolve => csvStream.on('end', resolve));

    const transactions = await this.addTransactions(transactionsData);
    // console.log(transactions);

    return transactions;
  }
}

export default ImportTransactionsService;
