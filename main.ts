#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import { faker } from '@faker-js/faker';

// Customer Class
class Customer {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  mobNumber: number;
  accountNumber: number;

  constructor(fName: string, lName: string, age: number, gender: string, mNumber: number, accNumber: number) {
    this.firstName = fName;
    this.lastName = lName;
    this.age = age;
    this.gender = gender;
    this.mobNumber = mNumber;
    this.accountNumber = accNumber;
  }
}

// Interface Bank Account
interface BankAccount {
  accNumber: number;
  balance: number;
}

// Bank Class
class Bank {
  private customers: Customer[] = [];
  private accounts: BankAccount[] = [];

  addCustomer(customer: Customer) {
    this.customers.push(customer);
  }

  addAccount(account: BankAccount) {
    this.accounts.push(account);
  }

  updateAccount(account: BankAccount) {
    const index = this.accounts.findIndex(acc => acc.accNumber === account.accNumber);
    if (index !== -1) {
      this.accounts[index] = account;
    }
  }

  findCustomerByAccountNumber(accountNumber: number): Customer | undefined {
    return this.customers.find(customer => customer.accountNumber === accountNumber);
  }

  findAccountByAccountNumber(accountNumber: number): BankAccount | undefined {
    return this.accounts.find(account => account.accNumber === accountNumber);
  }

  getCustomers(): Customer[] {
    return this.customers;
  }
}

// Bank Service Class
class BankService {
  private bank: Bank;

  constructor(bank: Bank) {
    this.bank = bank;
  }

  async start() {
    while (true) {
      const service = await inquirer.prompt([
        {
          name: 'select',
          type: 'list',
          message: 'Please select a service',
          choices: ['View Balance', 'Cash Withdraw', 'Cash Deposit', 'Exit'],
        },
      ]);

      if (service.select === 'Exit') {
        console.log(chalk.italic.bold.magenta('<------------------------------------------------------->'));
        console.log(chalk.bold.red.italic('Exiting...'));
        process.exit();
      }

      const { input } = await inquirer.prompt({
        name: 'input',
        type: 'input',
        message: 'Please enter your account number:',
        validate: (input: string) => {
          if (!/^\d+$/.test(input)) {
            return 'Account number should be numeric.';
          }
          return true;
        }
      });

      const accountNumber = parseInt(input);
      const account = this.bank.findAccountByAccountNumber(accountNumber);
      const customer = this.bank.findCustomerByAccountNumber(accountNumber);

      if (!account) {
        console.log(chalk.red.bold.italic('Invalid Account Number!'));
        continue;
      }

      switch (service.select) {
        case 'View Balance':
          this.viewBalance(account, customer);
          break;

        case 'Cash Withdraw':
          await this.cashWithdraw(account);
          break;

        case 'Cash Deposit':
          await this.cashDeposit(account);
          break;
      }
    }
  }

  private viewBalance(account: BankAccount, customer: Customer | undefined) {
    console.log(chalk.italic.bold.magenta('<------------------------------------------------------->'));
    console.log(`Dear ${chalk.green.italic(customer?.firstName)} ${chalk.green.italic(customer?.lastName)}, your account balance is ${chalk.bold.blue.italic(`$${account.balance}`)}.`);
    console.log(chalk.italic.bold.magenta('<------------------------------------------------------->'));
  }

  private async cashWithdraw(account: BankAccount) {
    const { withdrawAmount } = await inquirer.prompt({
      name: 'withdrawAmount',
      type: 'number',
      message: 'Please enter the amount to withdraw:',
      validate: (value: number) => {
        if (value <= 0) {
          return 'Please enter a valid amount to withdraw.';
        }
        return true;
      }
    });

    if (withdrawAmount <= account.balance) {
      account.balance -= withdrawAmount;
      this.bank.updateAccount(account);
      console.log(chalk.italic.bold.magenta('<------------------------------------------------------->'));
      console.log(chalk.bold.italic.magenta(`Successfully withdrew ${chalk.green(withdrawAmount)} from account ${chalk.gray(account.accNumber)}. New balance: ${chalk.bold.green(account.balance)}.`));
      console.log(chalk.italic.bold.magenta('<------------------------------------------------------->'));
    } else {
      console.log(chalk.red.bold.italic('Insufficient Balance!'));
      console.log(chalk.italic.bold.magenta('<------------------------------------------------------->'));
    }
  }

  private async cashDeposit(account: BankAccount) {
    const { depositAmount } = await inquirer.prompt({
      name: 'depositAmount',
      type: 'number',
      message: 'Please enter the amount to deposit:',
      validate: (value: number) => {
        if (value <= 0) {
          return 'Please enter a valid amount to deposit.';
        }
        return true;
      }
    });

    account.balance += depositAmount;
    this.bank.updateAccount(account);
    console.log(chalk.italic.bold.magenta('<------------------------------------------------------->'));
    console.log(chalk.bold.italic.magenta(`Successfully deposited ${chalk.green(depositAmount)} to account ${chalk.gray(account.accNumber)}. New balance: ${chalk.bold.green(account.balance)}.`));
    console.log(chalk.italic.bold.magenta('<------------------------------------------------------->'));
  }
}

// Initial Setup
const meezanBank = new Bank();
for (let i = 1; i <= 3; i++) {
  const fName = faker.name.firstName('male');
  const lName = faker.name.lastName('male');
  const number = parseInt(faker.phone.number('##########'));
  const cus = new Customer(fName, lName, 18 * i, 'male', number, 1000 + i);
  meezanBank.addCustomer(cus);
  meezanBank.addAccount({ accNumber: cus.accountNumber, balance: 1000 * i });
}

// Print account numbers and customer names
meezanBank.getCustomers().forEach(customer => {
  console.log(`Customer: ${customer.firstName} ${customer.lastName}, Account Number: ${customer.accountNumber}`);
});

console.log(chalk.italic.bold.magenta('<------------------------------------------------------->'));
console.log(chalk.italic.bold.magenta('<------------------  WELCOME TO MY BANK ------------------->'));
console.log(chalk.italic.bold.magenta('<------------------------------------------------------->'));

// Start the bank service
const bankService = new BankService(meezanBank);
bankService.start();
