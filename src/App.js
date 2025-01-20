import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom"
import SiteLayout from "./component/Layout/site/SiteLayout"
import DashLayout from "./component/Layout/dash/DashLayout"
import UsersList from "./fetures/users/List/UsersList"
import AddUser from "./fetures/users/add/AddUser"
import SingleUser from "./fetures/users/view/SingleUser"
import CustomersList from "./fetures/customers/List/CustomersList"
import AddCustomer from "./fetures/customers/add/AddCustomer"
import SingleCustomer from "./fetures/customers/view/singleCustomer"
import ProductsList from "./fetures/products/List/ProductsList"
import AddProduct from "./fetures/products/add/AddProduct"
import SingleProduct from "./fetures/products/view/SingleProduct"
import LoginPage from "./fetures/auth/login/LoginPage"
import RequireAuth from "./fetures/auth/RequireAuth"
import PersistsLogin from "./fetures/auth/PersistLogin"
import HomePage from "./fetures/home/HomePage"
import SingleProductPublic from "./fetures/products/view/singleProductPublic"
import RegistPage from "./fetures/auth/regist/RegistPage"
import HomeMain from "./fetures/home/HomeMain"
import FavouritesList from "./fetures/products/List/FavouritesList"
import ProductListPublic from "./fetures/products/List/ProductsListPublic"
import ScrollToTop from './ScrollToTop';
import PlumaAbout from "./fetures/about/PlumaAbout"
import Regulation from "./fetures/regulation/Regulations"
import Posts from "./fetures/posts/Posts"
import SportLinePost from "./fetures/posts/SportLinePost"
import WinterPost from "./fetures/posts/WinterPost"
import SafePost from "./fetures/posts/SafePost"
import CarriagePost from "./fetures/posts/CarriagePost"
import BadPost from "./fetures/posts/BadPost"
import UsersListDemo from "./fetures/users/List/UsersListDemo"

import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import AddTransaction from "./fetures/transactions/add/AddTransaction"
import AddService from "./fetures/services/add/AddService"
import ServicesList from "./fetures/services/list/ServicesList"
import SingleService from "./fetures/services/view/SingleService"
import useAgentData from "./hooks/useAgentData"
import useAuth from "./hooks/useAuth"
import UnderConstruction from "./component/UnderConstruction"
// import FeedbackForm from "./fetures/pages/FeedbackForm"
// import ContactForm from "./fetures/pages/ContactForm"


const App = () => {
    const { phone } = useAuth();
    useAgentData(phone); // הפעלת ה-hook
    return <Router>
        <ScrollToTop />
        <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="regist" element={<RegistPage />} />
            <Route path="/" element={<SiteLayout />} >
                <Route element={<PersistsLogin />}>
                    <Route element={<RequireAuth allowRoles={['admin', 'user']} />}>
                        <Route path="/dash" element={<DashLayout />}>
                            <Route path="UnderConstruction" element={<UnderConstruction />} />
                            <Route index element={<HomeMain />} />
                            <Route path="customers" element={<Outlet />}>
                                <Route index element={<CustomersList />} />
                                <Route path="add" element={<AddCustomer />} />
                                <Route path=":userId" element={<SingleCustomer />} />
                            </Route>
                            <Route path="services" element={<Outlet />}>
                                <Route index element={<ServicesList />} />
                                <Route path="add" element={<AddService />} />
                                <Route path=":userId" element={<SingleService />} />
                            </Route>
                            <Route path="transactions" element={<Outlet />}>
                                {/* <Route index element={<CustomersList />} /> */}
                                <Route path="add" element={<AddTransaction />} />
                                {/* <Route path=":userId" element={<SingleCustomer />} /> */}
                            </Route>
                            <Route element={<RequireAuth allowRoles={['admin']} />}>
                                <Route path="users" element={<Outlet />}>
                                    <Route index element={<UsersList />} />
                                    <Route path="add" element={<AddUser />} />
                                    <Route path=":userId" element={<SingleUser />} />
                                </Route>
                            </Route>
                            <Route element={<RequireAuth allowRoles={['admin']} />}>
                                <Route path="products" element={<Outlet />}>
                                    <Route index element={<ProductsList />} />
                                    <Route path="add" element={<AddProduct />} />
                                    <Route path=":productBarcod" element={<SingleProduct />} />
                                </Route>
                            </Route>
                        </Route>
                    </Route>
                </Route>
            </Route>
        </Routes>
        <ToastContainer />
    </Router>
}
export default App