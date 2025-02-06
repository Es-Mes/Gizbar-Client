import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom"
import SiteLayout from "./component/Layout/site/SiteLayout"
import DashLayout from "./component/Layout/dash/DashLayout"
import UsersList from "./fetures/users/List/UsersList"
import AddUser from "./fetures/users/add/AddUser"
import SingleUser from "./fetures/users/view/SingleUser"
import CustomersList from "./fetures/customers/List/CustomersList"
import AddCustomer from "./fetures/customers/add/AddCustomer"
import SingleCustomer from "./fetures/customers/view/singleCustomer"
import LoginPage from "./fetures/auth/login/LoginPage"
import RequireAuth from "./fetures/auth/RequireAuth"
import PersistsLogin from "./fetures/auth/PersistLogin"
import RegistPage from "./fetures/auth/regist/RegistPage"
import HomeMain from "./fetures/home/HomeMain"
import ScrollToTop from './ScrollToTop';
import UsersListDemo from "./fetures/users/List/UsersListDemo"

import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import AddTransaction from "./fetures/transactions/add/AddTransaction"
import TransactionsAsProvider from "./fetures/transactions/list/TransactionsAsProvider"
import AddService from "./fetures/services/add/AddService"
import ServicesList from "./fetures/services/list/ServicesList"
import SingleService from "./fetures/services/view/SingleService"
import useAgentData from "./hooks/useAgentData"
import useAuth from "./hooks/useAuth"
import useTransactionsData from "./hooks/useTransactionsData"
import UnderConstruction from "./component/UnderConstruction"
import DelayedTransactions from "./fetures/transactions/list/delayedTransactions"
import FreezedServices from "./fetures/services/list/FreezedServices"
import AllTransactions from "./fetures/transactions/list/AllTransactions"
import useCustomerTransactionsData from "./hooks/useCustomerTransactionsData"
// import FeedbackForm from "./fetures/pages/FeedbackForm"
// import ContactForm from "./fetures/pages/ContactForm"


const App = () => {
    const { phone } = useAuth();
    useAgentData(phone); // הפעלת ה-hook
    useTransactionsData(phone);
    useCustomerTransactionsData(phone)
    return <Router>
        <ScrollToTop />
        <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="regist" element={<RegistPage />} />
            <Route path="/" element={<LoginPage />} />
            <Route path="/dash" element={<DashLayout />}>
                <Route element={<PersistsLogin />}>
                    <Route element={<RequireAuth allowRoles={['admin', 'user']} />}>
                        <Route path="UnderConstruction" element={<UnderConstruction />} />
                        <Route index element={<HomeMain />} />
                        <Route path="customers" element={<Outlet />}>
                            <Route index element={<CustomersList />} />
                            <Route path="add" element={<AddCustomer />} />
                            <Route path=":userId" element={<SingleCustomer />} />
                        </Route>
                        <Route path="services" element={<Outlet />}>
                            <Route index element={<ServicesList />} />
                            <Route path="freezed" element={<FreezedServices />} />
                            <Route path="add" element={<AddService />} />
                            <Route path=":userId" element={<SingleService />} />
                        </Route>
                        <Route path="transactions/income" element={<Outlet />}>
                            <Route index element={<TransactionsAsProvider />} />
                            <Route path="all" element={<AllTransactions />} />
                            <Route path="add" element={<AddTransaction />} />
                            <Route path="delayed" element={<DelayedTransactions />} />
                        </Route>
                        {/* <Route element={<RequireAuth allowRoles={['admin']} />}>
                                <Route path="users" element={<Outlet />}>
                                    <Route index element={<UsersList />} />
                                    <Route path="add" element={<AddUser />} />
                                    <Route path=":userId" element={<SingleUser />} />
                                </Route>
                            </Route> */}
                    </Route>
                </Route>
            </Route>
        </Routes>
        <ToastContainer />
    </Router>
}
export default App