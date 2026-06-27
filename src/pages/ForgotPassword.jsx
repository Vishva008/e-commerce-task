import { useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  async function sendResetLink() {
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            "http://localhost:5173/reset-password",
        }
      );

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Password reset link has been sent to your email."
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-md mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">
          Forgot Password
        </h1>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border p-3 rounded mb-4"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <button
          onClick={sendResetLink}
          className="bg-blue-600 text-white px-6 py-3 rounded w-full"
        >
          Send Reset Link
        </button>
      </div>
    </>
  );
}

export default ForgotPassword;