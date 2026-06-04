import { Navigate } from "react-router-dom";
import LayoutDefault from "../layout/layoutDefault";
import Home from "../pages/client/Home";
import ProductDetail from "../pages/client/ProductDetail";
import Login from "../pages/client/Login";
import Register from "../pages/client/Register";
import Profile from "../pages/client/Profile";
import PrivateRoute from "../PrivateRoute";

// Admin imports
import AdminLayout from "../layout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminVehicleModels from "../pages/admin/AdminVehicleModels";
import AdminVehicleCategories from "../pages/admin/AdminVehicleCategories";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminPermissions from "../pages/admin/AdminPermissions";
import AdminRoles from "../pages/admin/AdminRoles";
import About from "../pages/client/About";
import News from "../pages/client/News";
import NewsDetail from "../pages/client/News/NewsDetail";

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
