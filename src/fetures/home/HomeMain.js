import { Link, NavLink } from "react-router-dom"
import "./HomeMain.css"
import React, { useState, useEffect } from 'react'
import { useAddUserMutation } from "../users/UsersApiSlice";
import { useGetUserQuery } from "../users/UsersApiSlice";
import useAuth from "../../hooks/useAuth";
import useTransactionsData from "../../hooks/useTransactionsData";
import { useSelector } from "react-redux";
import TransactionsList from "../transactions/list/TransactionsList";
const HomeMain = () => {
   const { _id, phone } = useAuth()
   // const { data: agent, isLoading, error } = useGetUserQuery({ phone })

   // if (isLoading) return <p>Loading...</p>;
   // if (error) return <p>Error: {error.message}</p>;
   const agent = useSelector((state) => state.agent.data.data || {});
   const transactions = useSelector((state) => state.transactions.data.transactions.data || []);
   const isLoading = useSelector((state) => state.agent?.isLoading);
   const error = useSelector((state) => state.agent?.error);
   const isLoadingTransactions = useSelector((state) => state.transactions?.isLoading);
   const errorLoadingTransactions = useSelector((state) => state.transactions?.error);
   // const copyTransactions = [...transactions];
   console.log(`agent${agent}`);
   // console.log(JSON.stringify(transactions, null, 2));
   // console.dir(`transactions${transactions}`, { depth: null, colors: true });
   //    transactions.forEach(transaction => {
   //       console.log(transaction);
   //   });
   const transactionsAsProvider = [...transactions].filter(transaction =>
      transaction.agent == _id
   );
   // console.log(`agent transactions:${transactionsAsProvider}`);
   // console.log(JSON.stringify(transactionsAsProvider, null, 2));
   const transactionsAsCustomer = [...transactions].filter(transaction =>
      transaction.agent !== _id
   );

   //הכנסות בחודש הנוכחי 

   const [monthIncome, setMonthIncome] = useState(0);
   const [monthExpectedIncome, setMonthExpectedIncome] = useState(0);
   const [currentMonth, setCurrentMonth] = useState('');

   useEffect(() => {
      const today = new Date();
      const firstDayInThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthName = today.toLocaleString('default', { month: 'long' });
      setCurrentMonth(monthName);

      console.log(`firstDayInThisMonth: ${firstDayInThisMonth}`);

      //////חישוב הכנסות עד כה (לא כולל היום) בחודש זה
      const thisMonthTransactionsAsProvider = transactionsAsProvider
         .filter(transaction => {
            const billingDate = new Date(transaction.billingDay);
            return transaction.status === "paid" &&
              billingDate >= firstDayInThisMonth &&
              billingDate < today;
         });
      console.log(`thisMonthTransactionsAsProvider${thisMonthTransactionsAsProvider}`);

      // חישוב סך ההכנסות
      const totalIncome = thisMonthTransactionsAsProvider.reduce((acc, transaction) => {
         return acc + transaction.price;
      }, 0);

      // עדכון הסטייט
      setMonthIncome(totalIncome);

      console.log(`monthIncome: ${totalIncome}`);

      //////חישוב הכנסות עתידיות לחודש זה
      const thisMonthExpectedTransactionsAsProvider = transactionsAsProvider
         .filter(transaction => {
            const billingDate = new Date(transaction.billingDay);
            return transaction.status === "pendingCharge" &&
              billingDate.getMonth() === firstDayInThisMonth.getMonth() &&
              billingDate >= today;
         });
      console.log(`thisMonthExpectedTransactionsAsProvider${thisMonthExpectedTransactionsAsProvider}`);

      // חישוב סך ההכנסות
      const totalExpectedIncome = thisMonthExpectedTransactionsAsProvider.reduce((acc, transaction) => {
         return acc + transaction.price;
      }, 0);

      // עדכון הסטייט
      setMonthExpectedIncome(totalExpectedIncome);

      console.log(`monthExpectedIncome: ${totalExpectedIncome}`);

   }, [transactionsAsProvider]);  // useEffect יפעל רק אם transactionsAsProvider משתנה


   //עסקאות
   const filterRecentTransactions = (transactionsAsProvider) => {
      const today = new Date();
      return [...transactionsAsProvider]
         .filter(transaction =>
            transaction.status !== "canceld"  // רק עסקאות שלא בוטלו
            // new Date(transaction.billingDay) <= today // תאריך גבייה מאוחר מהיום
         )
         // .sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate)) // למיין לפי תאריך הגבייה (מוקדם לראשון)
         .slice(0, 5) // חמש הראשונות
         .map(transaction => ({
            ...transaction, // שומר את שאר המידע של העסקה
            agent: undefined, // מחיקת שדה agent
         }));
   };
   const recentTransactions = filterRecentTransactions(transactionsAsProvider);

   const filterPendingTransactions = (transactionsAsProvider) => {
      // קבלת תאריך נוכחי
      const today = new Date();

      return [...transactionsAsProvider]
         .filter(transaction =>
            transaction.status === "pendingCharge" && // רק עסקאות שלא נגבו
            new Date(transaction.billingDay) > today // תאריך גבייה מאוחר מהיום
         )
         .sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate)) // למיין לפי תאריך הגבייה (מוקדם לראשון)
         .slice(0, 5); // חמש הראשונות
   };


   const pendingTransactions = filterPendingTransactions(transactionsAsProvider);


   if (isLoading) return <p>Loading...</p>;
   if (error) return <p>Error: {error}</p>;
   if (isLoadingTransactions) return <p>Loading transactions...</p>;
   if (errorLoadingTransactions) return <p>Error: {error}</p>;
   return (
      <>
      <div className="income-display">
            <h2> סיכום הכנסות חודש {currentMonth}</h2>
            <div className="income-details">
               <p>כבר בחשבון  : {monthIncome} ₪</p>
               <p>הכנסות צפויות: {monthExpectedIncome} ₪</p>
               <p>סך הכול : {monthExpectedIncome + monthIncome} ₪</p>

            </div>
         </div>
         
         <div className="QuickActions">
            <button>
               <Link to="services/add">הוספת שירות</Link>
            </button>
            <button>
               <Link to="customers/add">הוספת לקוח</Link>
            </button>
            <button>
               <Link to="transactions/income/add">הוספת עסקה</Link>
            </button>
         </div>

         <div className="transactions-display">
            <div>
               <h2>עסקאות אחרונות</h2>
               <TransactionsList transactions={recentTransactions} />
            </div>
            <div>
               <h2>עסקאות קרובות</h2>
               <TransactionsList transactions={pendingTransactions} />
            </div>
         </div>


      </>


   );
};

export default HomeMain;