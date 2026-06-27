import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    const { data, error } = await supabase
      .from("profile")
      .select("id, full_name, email, phone, address, created_at");

    if (error) {
      console.error(error);
      return;
    }

    setUsers(data || []);
  }

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          (user.full_name || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (user.email || "")
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [users, search]
  );

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">
          Manage Users
        </h1>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full border p-3 rounded mb-6"
        />

        <p className="mb-4 font-semibold">
          Total Users: {filteredUsers.length}
        </p>

        <table className="w-full border border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3">Name</th>
              <th className="border p-3">Email</th>
              <th className="border p-3">Phone</th>
              <th className="border p-3">Address</th>
              <th className="border p-3">Joined</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="border p-3">
                    {user.full_name || "Not Provided"}
                  </td>

                  <td className="border p-3">
                    {user.email || "-"}
                  </td>

                  <td className="border p-3">
                    {user.phone || "-"}
                  </td>

                  <td className="border p-3">
                    {user.address || "-"}
                  </td>

                  <td className="border p-3">
                    {user.created_at
                      ? new Date(
                          user.created_at
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center p-6 text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ManageUsers;