import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

function Profile() {
  const [user, setUser] = useState(null);

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
  document.title = "My Profile | E-Shop";
}, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUser(user);

    const {
      data: profile,
      error,
    } = await supabase
      .from("profile")
      .select("full_name, phone, address")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(error);
      return;
    }

    // First time user
    if (!profile) {
      const { error: insertError } =
       await supabase
  .from("profile")
  .insert([
    {
      user_id: user.id,
      email: user.email,
      full_name: "",
      phone: "",
      address: "",
    },
  ]);

      if (insertError) {
        console.error(insertError);
      }

      return;
    }

    setFullName(profile.full_name || "");
    setPhone(profile.phone || "");
    setAddress(profile.address || "");
  }

  async function saveProfile() {
    const { error } = await supabase
      .from("profile")
      .update({
  email: user.email,
  full_name: fullName,
  phone,
  address,
})
      .eq("user_id", user.id);

    if (error) {
  console.error(error);
  alert(error.message);
  return;
}

    alert("Profile updated successfully.");
  }

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">
          My Profile
        </h1>

        <div className="border rounded-lg p-6 space-y-5">

          <div>
            <label className="font-semibold">
              Email
            </label>

            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full border p-3 rounded mt-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="font-semibold">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              className="w-full border p-3 rounded mt-2"
            />
          </div>

          <div>
            <label className="font-semibold">
              Phone
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="w-full border p-3 rounded mt-2"
            />
          </div>

          <div>
            <label className="font-semibold">
              Address
            </label>

            <textarea
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              rows={4}
              className="w-full border p-3 rounded mt-2"
            />
          </div>

          <button
            onClick={saveProfile}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>

        </div>
      </div>
    </>
  );
}

export default Profile;