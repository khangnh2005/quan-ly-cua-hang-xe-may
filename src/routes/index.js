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
import AdminOrders from "../pages/AdminOrders";
import AdminCustomers from "../pages/AdminCustomers";
import AdminSettings from "../pages/AdminSettings";

export const routes = [
    // === CLIENT ROUTES ===
    {
        path: "/",
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
            { path: "products", element: <AdminProducts /> },
            { path: "orders", element: <AdminOrders /> },
            { path: "customers", element: <AdminCustomers /> },
            { path: "settings", element: <AdminSettings /> },
        ]
    }
]