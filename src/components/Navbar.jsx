import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CartContext } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const navigate = useNavigate();

  const { cart } = useContext(CartContext);
  const { user, isAdmin } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const navStyle = ({ isActive }) =>
    isActive
      ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1 transition-all"
      : "text-black hover:text-blue-600 transition-all";

  return (
    <nav className="shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-10 py-5">

        <NavLink
          to="/"
          className="text-3xl font-bold"
        >
          E-Shop
        </NavLink>

        <div className="flex items-center gap-10 text-xl">

          <NavLink
            to="/"
            className={navStyle}
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={navStyle}
          >
            Products
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/cart"
                className={navStyle}
              >
                Cart ({cart.length})
              </NavLink>

              <NavLink
                to="/orders"
                className={navStyle}
              >
                Orders
              </NavLink>

              <NavLink
                to="/profile"
                className={navStyle}
              >
                Profile
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={navStyle}
                >
                  Admin
                </NavLink>
              )}

              <span className="text-gray-600">
                {user.email}
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={navStyle}
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={navStyle}
              >
                Register
              </NavLink>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
