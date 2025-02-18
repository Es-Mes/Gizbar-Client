import React from 'react'
import ExpensesList from './list/ExpensesList'
import { useSelector } from 'react-redux';

const ExpensesPage = () => {
const transactionsAsCustomer = useSelector((state) => state.customerTransactions.transactions || []);
console.log(transactionsAsCustomer);
const filterRecentTransactions = (transactions) => {
    if (transactions == null) {
       return [];
    }
    return [...transactions]
       .filter(transaction =>
          transaction.status !== "canceld"  // רק עסקאות שלא בוטלו
       )
 };
 const recentTransactions = filterRecentTransactions(transactionsAsCustomer);
  return (
    <div>
        <h2>עסקאות לקוח</h2>
      <ExpensesList transactions={recentTransactions}/>
    </div>
  )
}

export default ExpensesPage
