import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom"
import SiteLayout from "./component/Layout/site/SiteLayout"
import DashLayout from "./component/Layout/dash/DashLayout"
import CustomersList from "./fetures/customers/List/CustomersList"
import AddCustomer from "./fetures/customers/add/AddCustomer"
import LoginPage from "./fetures/auth/login/LoginPage"
import RequireAuth from "./fetures/auth/RequireAuth"
import PersistsLogin from "./fetures/auth/PersistLogin"
import RegistPage from "./fetures/auth/regist/RegistPage"
import HomeMain from "./fetures/home/HomeMain"
import ScrollToTop from './ScrollToTop';

import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import AddTransaction from "./fetures/transactions/add/AddTransaction"
import TransactionsAsProvider from "./fetures/transactions/list/TransactionsAsProvider"
import AddService from "./fetures/services/add/AddService"
import ServicesList from "./fetures/services/list/ServicesList"
import useAuth from "./hooks/useAuth"
import UnderConstruction from "./component/UnderConstruction"
import AllTransactions from "./fetures/transactions/list/AllTransactions"
import PersonalSettings from "./fetures/settings/PersonalSettings"
import ExpensesList from "./fetures/expenses/list/ExpensesList"
import ExpensesPage from "./fetures/expenses/ExpensesPage"
import PaymentIframe from "./component/payment/PaymentForm"
import PaymentPage from "./component/payment/PaymentPage"
// import FeedbackForm from "./fetures/pages/FeedbackForm"
// import ContactForm from "./fetures/pages/ContactForm"
import { useEffect } from "react";
import TransactionsMenu from "./fetures/transactions/view/TransactionsMenu"
import TransactionsAsCustomer from "./fetures/transactions/list/TransactionsAsCustomer"
import { useDispatch, useSelector } from "react-redux"
import { setToken } from "./fetures/auth/authSlice"
import SingleCustomer from "./fetures/customers/view/SingleCustomer"
import './toast-custom.css';
import PaymentDetails from "./component/payment/paymentDetails"
import AgentsList from "./fetures/agent/list/AgentsList"


const App = () => {

    const dispatch = useDispatch()
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
            dispatch(setToken({ accessToken }))
        } else {
            // גם אם אין טוקן, עדיין נרצה לעדכן ש־isInitialized יהיה true
            dispatch({ type: 'auth/logout' })
        }
    }, [dispatch])

    return <Router>
        <ScrollToTop />
        <Routes>
            <Route exact path="/" element={<Navigate to="/login" />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="regist" element={<RegistPage />} />

            <Route path="/payment/:agentPhone/:transactionId" element={<PaymentPage />} />


            <Route path="/dash" element={<DashLayout />}>
                <Route element={<PersistsLogin />}>
                    <Route element={<RequireAuth allowRoles={['admin', 'user']} />}>
                        {/* <Route path ="" */}
                        <Route path="UnderConstruction" element={<UnderConstruction />} />
                        <Route path="CreditPay" element={<PaymentPage />} />
                        
                        <Route index element={<HomeMain />} />
                        <Route path="settings/personal" element={<PersonalSettings />} />
                        <Route path="settings/paymentDetails" element={<PaymentDetails/>}/>
                        <Route path="customers" element={<Outlet />}>
                            <Route index element={<CustomersList />} />
                            <Route path="add" element={<AddCustomer />} />
                            <Route path=":customerId" element={<SingleCustomer />} />
                        </Route>
                        <Route path="services" element={<Outlet />}>
                            <Route index element={<ServicesList />} />
                            <Route path="add" element={<AddService />} />
                        </Route>
                        <Route path="transactions/:type" element={<Outlet />}>
                            <Route index element={<TransactionsMenu />} />
                            <Route path="providerList" element={<TransactionsAsProvider />} />
                            <Route path="customerList" element={<TransactionsAsCustomer />} />

                        </Route>
                        <Route element={<RequireAuth allowRoles={["admin"]}/>}>
                            <Route path="agents" element={<Outlet />}>
                            <Route index element={<AgentsList />} />
                            <Route path="add" element={<AddCustomer />} />
                            <Route path=":customerId" element={<SingleCustomer />} />
                        </Route>
                        </Route>
                    </Route>
                </Route>
            </Route>
        </Routes>
        <ToastContainer
            position="bottom-left"
            autoClose={3000}
            hideProgressBar={true}
            closeOnClick
            rtl={true}
            pauseOnHover
            draggable={false}
            toastClassName="custom-toast"
            bodyClassName="custom-toast-body"
            limit={3}
            style={{ left: 0, bottom: 20 }} // מצמיד ממש לשמאל
            toastOptions={{
                icon: false
            }}
        />
    </Router>
}
export default App