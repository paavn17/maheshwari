"use client";

import InstituteLayout from "@/components/institute/page-layout";
import { useState } from "react";
import { Pencil, Check, X, Power, Plus } from "lucide-react";

const Page = () => {
  const [employees, setEmployees] = useState([
    { id: 1, name: "Suresh Reddy", email: "suresh@institute.com", role: "Manager", status: "Active" },
    { id: 2, name: "Divya Sharma", email: "divya@institute.com", role: "Coordinator", status: "Inactive" },
    { id: 3, name: "Vikram Rao", email: "vikram@institute.com", role: "Viewer", status: "Active" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "" });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format.";
    if (!formData.role.trim()) newErrors.role = "Role is required.";
    return newErrors;
  };

  const handleAdd = () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      const newEmployee = {
        id: employees.length + 1,
        ...formData,
        status: "Active",
      };
      setEmployees([...employees, newEmployee]);
      console.log("Added Employee:", newEmployee);
      setFormData({ name: "", email: "", role: "" });
      setShowForm(false);
    }
  };

  const handleEdit = (id) => {
    const emp = employees.find((e) => e.id === id);
    setEditingId(id);
    setFormData({ name: emp.name, email: emp.email, role: emp.role });
  };

  const handleSave = () => {
    const updated = employees.map((emp) =>
      emp.id === editingId ? { ...emp, ...formData } : emp
    );
    setEmployees(updated);
    console.log("Updated Employee:", formData);
    setEditingId(null);
    setFormData({ name: "", email: "", role: "" });
  };

  const toggleStatus = (id) => {
    const updated = employees.map((emp) =>
      emp.id === id ? { ...emp, status: emp.status === "Active" ? "Inactive" : "Active" } : emp
    );
    setEmployees(updated);
    console.log("Toggled Status for Employee ID:", id);
  };

  return (
    <InstituteLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6 text-sky-800">Upload Employees</h1>

        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            <Plus size={16} /> {showForm ? "Cancel" : "Add Employee"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 space-y-4 max-w-xl">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
            </div>
            <button
              onClick={handleAdd}
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md"
            >
              Submit
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden text-sm">
            <thead className="bg-sky-200 text-gray-700 text-left">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => {
                const isEditing = editingId === emp.id;
                return (
                  <tr
                    key={emp.id}
                    className={`border-t transition hover:bg-gray-50 ${emp.status === "Inactive" ? "bg-red-50 text-gray-500" : ""}`}
                  >
                    <td className="px-6 py-3 font-medium">{idx + 1}</td>
                    <td className="px-6 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="border px-2 py-1 rounded w-full"
                        />
                      ) : (
                        emp.name
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="border px-2 py-1 rounded w-full"
                        />
                      ) : (
                        emp.email
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="border px-2 py-1 rounded w-full"
                        />
                      ) : (
                        emp.role
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${emp.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2 items-center">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSave}
                              className="bg-green-500 hover:bg-green-600 text-white p-1 rounded"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-1 rounded"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(emp.id)}
                              className="text-sky-600 hover:text-sky-800 p-1"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => toggleStatus(emp.id)}
                              className={`p-1 rounded ${emp.status === "Active" ? "text-red-500 hover:text-red-700" : "text-green-500 hover:text-green-700"}`}
                              title={emp.status === "Active" ? "Deactivate" : "Activate"}
                            >
                              <Power size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </InstituteLayout>
  );
};

export default Page;