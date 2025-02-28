import { setAlert } from "@/state/app";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

interface StaffFormData {
  name: string;
  phone_number: string;
  email: string;
  password: string;
  work_id: string;
  department: string;
  role: string;
}

const StaffRegistration = () => {
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [departments, setDepartments] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);
  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    phone_number: "",
    email: "",
    password: "",
    work_id: "",
    department: "",
    role: "",
  });

  const [errors, setErrors] = useState<Partial<StaffFormData>>({});

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/departments`
        );
        if (response.status === 200) {
          const departments = response.data.departments;
          setDepartments(departments);
        }
      } catch (error) {
        console.error("Error loading departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  const validateForm = () => {
    const newErrors: Partial<StaffFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone_number) {
      newErrors.phone_number = "Phone number is required";
    }

    if (!formData.work_id) {
      newErrors.work_id = "Work ID is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof StaffFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      setSubmitting(true);
      try {
        const registrationResponse = await axios.post(
          `${import.meta.env.VITE_SERVER_HEAD}/users/register`,
          formData
        );
        if (registrationResponse.status !== 200) {
          throw new Error(
            registrationResponse.data.message || "An unexpected error occurred."
          );
        }
        dispatch(
          setAlert({
            message: "Staff member registered successfully",
            type: "success",
          })
        );
      } catch (error: any) {
        console.error("Error submitting form:", error);
        dispatch(
          setAlert({
            message: error.response.data.error || error.message,
            type: `${error.response.status === 404 ? "warning" : "error"}`,
          })
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="p-6 dark:bg-boxdark rounded-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-300">
          Register New Staff Member
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          Enter the details of the new staff member below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-400">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border dark:text-gray-100 ${
                errors.name ? "border-red-500" : ""
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-400">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border dark:bg-boxdark ${
                errors.role ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            >
              <option value="">Select Role</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="receptionist">Receptionist</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-400">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border dark:bg-boxdark ${
                errors.department ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-400">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.email ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-400">
              Phone
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.phone_number ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="Enter phone number"
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-400">
              Work ID
            </label>
            <input
              type="text"
              name="work_id"
              value={formData.work_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.work_id ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="Enter username"
            />
            {errors.work_id && (
              <p className="text-red-500 text-sm mt-1">{errors.work_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-400">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.password ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: "",
                phone_number: "",
                email: "",
                password: "",
                work_id: "",
                department: "",
                role: "",
              });
              setErrors({});
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200"
          >
            {submitting ? "Registering..." : "Register Staff"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffRegistration;
