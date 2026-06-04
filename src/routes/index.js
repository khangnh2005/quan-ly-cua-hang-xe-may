import { Navigate } from "react-router-dom";
import LayoutDefault from "../layout/layoutDefault";
import Home from "../pages/Home";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import PrivateRoute from "../PrivateRoute";

// Admin imports
import AdminLayout from "../layout/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import AdminProducts from "../pages/AdminProducts";
import AdminVehicleModels from "../pages/AdminVehicleModels";
import AdminVehicleCategories from "../pages/AdminVehicleCategories";
import AdminOrders from "../pages/AdminOrders";
import AdminCustomers from "../pages/AdminCustomers";
import AdminSettings from "../pages/AdminSettings";
import AdminPermissions from "../pages/AdminPermissions";
import AdminRoles from "../pages/AdminRoles";
import About from "../pages/About";
import News from "../pages/News";
import NewsDetail from "../pages/News/NewsDetail";

export const routes = [
    // === CLIENT ROUTES ===
    {
        element : <LayoutDefault />,
        children : [
            { index: true, element: <Home /> },
            { path: "product/detail/:id", element: <ProductDetail /> },
            {
                path: "profile",
                element : <PrivateRoute />,
                children : [
                    { index: true, element: <Profile /> }
                ]
            },
            {
                path :"/about" , element : <About />
            },
            {
                path :"/news" , element : <News />
            },
            {
                path :"/news/:id" , element : <NewsDetail />
            }
        ]
    },
    {
        path: "/login",
        element : <Login />
    },
    {
        path: "/register",
        element : <Register />
    },

    // === ADMIN ROUTES ===
    // AdminLayout tự xử lý: chưa login → hiển thị form login, đã login → hiển thị layout
    {
        path: "/admin",
        element : <AdminLayout />,
        children : [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: "dashboard", element: <AdminDashboard /> },
            { path: "vehicles", element: <AdminProducts /> },
            { path: "vehicle-models", element: <AdminVehicleModels /> },
            { path: "vehicle-categories", element: <AdminVehicleCategories /> },
            { path: "orders", element: <AdminOrders /> },
            { path: "customers", element: <AdminCustomers /> },
            { path: "settings", element: <AdminSettings /> },
            { path: "permissions", element: <AdminPermissions /> },
            { path: "roles", element: <AdminRoles /> },
        ]
    }
]