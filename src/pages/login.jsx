import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

function Login() {
  const navigate = useNavigate();

  // Email + Password
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  // OTP Login
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] =
    useState(false);
  const [loadingOtp, setLoadingOtp] =
    useState(false);

  // -------------------------------
  // Email + Password Login
  // -------------------------------
  async function handleLogin(e) {
    e.preventDefault();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login Successful");

    navigate("/", {
      replace: true,
    });
  }

  // -------------------------------
  // Send Email OTP
  // -------------------------------
  async function sendOtp() {
    if (!email) {
      alert("Please enter your email.");
      return;
    }

    setLoadingOtp(true);

    const { error } =
      await supabase.auth.signInWithOtp({
        email,
      });

    setLoadingOtp(false);

    if (error) {
      alert(error.message);
      return;
    }

    setOtpSent(true);

    alert(
      "OTP has been sent to your email."
    );
  }

  // -------------------------------
  // Verify OTP
  // -------------------------------
  async function verifyOtp() {
    if (!otp) {
      alert("Enter the OTP.");
      return;
    }

    const { error } =
      await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("OTP Verified Successfully");

    navigate("/", {
      replace: true,
    });
  }
    return (
    <>
      <Navbar />

      <div className="max-w-md mx-auto mt-16 p-8 border rounded-lg shadow">

        <h1 className="text-3xl font-bold text-center mb-8">
          Login
        </h1>

        {/* ---------------- Password Login ---------------- */}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline text-sm"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        {/* ---------------- Divider ---------------- */}

        <div className="flex items-center my-8">
          <div className="flex-1 border-t"></div>

          <span className="mx-4 text-gray-500">
            OR
          </span>

          <div className="flex-1 border-t"></div>
        </div>

        {/* ---------------- OTP Login ---------------- */}

        <h2 className="text-xl font-semibold mb-4 text-center">
          Login with Email OTP
        </h2>

        <input
          type="email"
          placeholder="Enter Email"
          className="w-full border p-3 rounded mb-4"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        {!otpSent ? (
          <button
            onClick={sendOtp}
            disabled={loadingOtp}
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
          >
            {loadingOtp
              ? "Sending OTP..."
              : "Send OTP"}
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
              className="w-full border p-3 rounded mt-4"
            />

            <button
              onClick={verifyOtp}
              className="w-full bg-purple-600 text-white p-3 rounded mt-4 hover:bg-purple-700"
            >
              Verify OTP
            </button>
          </>
        )}

        {/* ---------------- Register ---------------- */}

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>

      </div>
    </>
  );
}

export default Login;