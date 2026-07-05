"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  // Country stats
  const countryCounts: Record<string, number> = {};
  users.forEach((u) => {
    const c = u.country.trim();
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });
  const sortedCountries = Object.entries(countryCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.country.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
      <p className="text-white/50 text-sm mb-8">
        Registered users and where they're joining from.
      </p>

      {/* Country stats */}
      {!loading && sortedCountries.length > 0 && (
        <div className="mb-8">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-3">
            By country
          </p>
          <div className="flex flex-wrap gap-2">
            {sortedCountries.map(([country, count]) => (
              <div
                key={country}
                className="bg-panel border border-line rounded-lg px-3.5 py-2 flex items-center gap-2"
              >
                <span className="text-white text-sm">{country}</span>
                <span className="bg-teal text-slate-bg text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, or country..."
        className="w-full sm:w-80 bg-field border border-line rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-teal transition mb-5"
      />

      {loading ? (
        <p className="text-white/40 text-sm">Loading...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-white/40 text-sm">No users found.</p>
      ) : (
        <div className="bg-panel border border-line rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 text-white/50 font-medium">Name</th>
                <th className="px-4 py-3 text-white/50 font-medium">Email</th>
                <th className="px-4 py-3 text-white/50 font-medium">Phone</th>
                <th className="px-4 py-3 text-white/50 font-medium">
                  Country
                </th>
                <th className="px-4 py-3 text-white/50 font-medium">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-4 py-3 text-white">{u.name}</td>
                  <td className="px-4 py-3 text-white/60">{u.email}</td>
                  <td className="px-4 py-3 text-white/60">{u.phone}</td>
                  <td className="px-4 py-3 text-white/60">{u.country}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}