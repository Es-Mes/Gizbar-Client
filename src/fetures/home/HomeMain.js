import { Link, NavLink } from "react-router-dom"
import "./HomeMain.css"

import React from 'react'
import { useAddUserMutation } from "../users/UsersApiSlice";

import { useGetUserQuery } from "../users/UsersApiSlice";
import useAuth from "../../hooks/useAuth";
import { useSelector } from "react-redux";
import TransactionsList from "../transactions/list/TransactionsList";
const HomeMain = () => {
   const { _id, phone } = useAuth()
   // const { data: agent, isLoading, error } = useGetUserQuery({ phone })

   // if (isLoading) return <p>Loading...</p>;
   // if (error) return <p>Error: {error.message}</p>;
   const agent = useSelector((state) => state.agent.data.data ||{});
   console.log(`agent${agent}`);
   const transactionsAsProvider = agent?.transactionsAsProvider || [];
   console.log(`transactions:${transactionsAsProvider}`);
   const isLoading = useSelector((state) => state.agent?.isLoading);
   const error = useSelector((state) => state.agent?.error);

//עסקאות
   const filterRecentTransactions = (transactionsAsProvider) => {
      return [...transactionsAsProvider].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5); // חמש האחרונות
   };
   const recentTransactions = filterRecentTransactions(transactionsAsProvider);

   const filterPendingTransactions = (transactionsAsProvider) => {
      return [...transactionsAsProvider].filter(transaction => !transaction.isCollected); // רק שלא נגבו
   };
   const pendingTransactions = filterPendingTransactions(transactionsAsProvider);


   if (isLoading) return <p>Loading...</p>;
   if (error) return <p>Error: {error}</p>;
   console.log(agent);
   return (
      <>
         {/* <h1>שלום {phone}{agent?.data?.first_name || "אורח"}</h1> */}
         <h1>שלום {agent?.phone || "אורח"}</h1>



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
               <h2>עסקאות שלא נגבו</h2>
               <TransactionsList transactions={pendingTransactions} />
            </div>
         </div>


      </>


   );
};

export default HomeMain;