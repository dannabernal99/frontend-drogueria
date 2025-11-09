import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Home from "./pages/Home/Home";
import ProductPage from "./pages/Admin/Product/ProductPage";
import UserPage from "./pages/Admin/User/UserPage";
import CategoryPage from "./pages/Admin/Category/CategoryPage";
import DashboardAdmin from "./pages/Admin/Dashboard/DashboardAdmin";
import DashboardUser from "./pages/User/Dashboard/DashboardUser";

function App() {
  return (
    <Router>
      <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  <Route
    path="/admin/dashboard"
    element={
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <DashboardAdmin />
      </ProtectedRoute>
    }
  />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute allowedRoles={["USER"]}>
        <DashboardUser />
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin/categories"
    element={
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <CategoryPage />
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin/products"
    element={
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <ProductPage />
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin/users"
    element={
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <UserPage />
      </ProtectedRoute>
    }
  />
</Routes>
    </Router>
  );
}

export default App;
