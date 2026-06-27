import { useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const navigate = useNavigate();

  async function updatePassword() {
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    // Sign the user out after password reset
    await supabase.auth.signOut();

    alert(
      "Password updated successfully. Please login again."
    );

    navigate("/login");
  }

  return (
    <>
      <Navbar />

      <div className="max-w-md mx-auto mt-16 p-8 border rounded-lg shadow">
        <h1 className="text-3xl font-bold text-center mb-8">
          Reset Password
        </h1>

        <div className="space-y-5">
          <input
            type="password"
            placeholder="New Password"
            className="w-full border p-3 rounded"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border p-3 rounded"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
          />

          <button
            onClick={updatePassword}
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
          >
            Update Password
          </button>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;