import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useRef } from "react";
import { useAuth } from "./contexts/AuthContext";

// Public Pages
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Login = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// User Pages
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Orders = lazy(() => import("./pages/orders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const Profile = lazy(() => import("./pages/profile"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ManageProducts = lazy(() => import("./pages/ManageProducts"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const EditProduct = lazy(() => import("./pages/EditProduct"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const ManageUsers = lazy(() => import("./pages/ManageUsers"));
const SalesOverview = lazy(() => import("./pages/SalesOverview"));

// Route Protection
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function PageFallback() {
  return (
    <h1 className="text-center mt-20 text-2xl">
      Loading...
    </h1>
  );
}

// Redirects to /login when the user signs out, using the already-loaded
// auth state from AuthContext instead of subscribing separately.
function SignOutRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const hadUser = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      hadUser.current = true;
    } else if (hadUser.current) {
      hadUser.current = false;
      navigate("/login");
    }
  }, [user, loading, navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <SignOutRedirect />

      <Suspense fallback={<PageFallback />}>
        <Routes>

          {/* ---------- Public Routes ---------- */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* ---------- User Routes ---------- */}

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ---------- Admin Routes ---------- */}

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <ManageProducts />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/add-product"
            element={
              <AdminRoute>
                <AddProduct />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/edit-product/:id"
            element={
              <AdminRoute>
                <EditProduct />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />

          {/* ✅ Admin Order Details Route */}
          <Route
            path="/admin/orders/:id"
            element={
              <AdminRoute>
                <OrderDetails />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/sales"
            element={
              <AdminRoute>
                <SalesOverview />
              </AdminRoute>
            }
          />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
