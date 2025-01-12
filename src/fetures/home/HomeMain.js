import { Link, NavLink } from "react-router-dom"
import "./HomeMain.css"

import React from 'react'
import { useAddUserMutation } from "../users/UsersApiSlice";

import { useGetUserQuery } from "../users/UsersApiSlice";
import useAuth from "../../hooks/useAuth";

const HomeMain = () => {
   const { _id, roles, phone, first_name, last_name, email, address, services, customers, transactionsAsProvider, transactionsAsCustomer, isActive, isDeleted } = useAuth()

   return (
      <>
         <h1>שלום {phone}</h1>
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
      </>


   );
};

export default HomeMain;