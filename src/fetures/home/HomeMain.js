import { Link, NavLink } from "react-router-dom"
import "./HomeMain.css"

import React from 'react'
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
   const agent = useSelector((state) => state.agent.data.data ||{});
   const transactions = useSelector((state) => state.transactions.data.transactions.data || []);
   // const copyTransactions = [...transactions];
   console.log(`agent${agent}`);
   console.log(JSON.stringify(transactions, null, 2));
   // console.dir(`transactions${transactions}`, { depth: null, colors: true });
//    transactions.forEach(transaction => {
//       console.log(transaction);
//   });
   // const transactionsAsProvider = agent?.transactionsAsProvider || [];
   const transactionsAsProvider = [...transactions].filter(transaction =>
      transaction.agent == _id
   );
   const transactionsAsCustomer = [...transactions].filter(transaction =>
      transaction.agent !== _id
   );

   console.log(`agent transactions:${transactionsAsProvider}`);
   const isLoading = useSelector((state) => state.agent?.isLoading);
   const error = useSelector((state) => state.agent?.error);

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
   console.log(agent);
   return (
      <>
         <div className="QuickActions">
            <button>
               <Link to="services/add">הוספת שירות</Link>
            </button>
            <button>
               <Link to="customers/add">הוספת לקוח</Link>
            </button>
            <button>
               <Link to="transactions/add">הוספת עסקה</Link>
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