// import axios, { AxiosInstance } from 'axios'

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// const api: AxiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true,
// })

// // Add request interceptor to include JWT access token
// api.interceptors.request.use(
//   (config) => {
//     const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`
//     }
//     return config
//   },
//   (error) => Promise.reject(error)
// )

// // Add response interceptor to handle token refresh and errors
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config

//     if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
//       originalRequest._retry = true
//       const refreshToken = localStorage.getItem('refreshToken')

//       if (refreshToken) {
//         try {
//           // Try to refresh the token
//           const response = await api.post('/token/refresh/', { refresh: refreshToken })
//           const { access, refresh } = response.data

//           // Update tokens
//           localStorage.setItem('accessToken', access)
//           if (refresh) {
//             localStorage.setItem('refreshToken', refresh)
//           }

//           // Retry original request with new token
//           originalRequest.headers.Authorization = `Bearer ${access}`
//           return api(originalRequest)
//         } catch (refreshError) {
//           // Refresh failed - clear auth and redirect to login
//           localStorage.removeItem('accessToken')
//           localStorage.removeItem('refreshToken')
//           localStorage.removeItem('user')
//           window.location.href = '/auth'
//           return Promise.reject(refreshError)
//         }
//       } else {
//         // No refresh token - redirect to login
//         localStorage.removeItem('accessToken')
//         localStorage.removeItem('user')
//         window.location.href = '/auth'
//       }
//     }

//     return Promise.reject(error)
//   }
// )

// export default api

// // API Service Helpers
// export const apiService = {
//   // Auth
//   login: (credential: string, password: string) =>
//     api.post('/auth/login/', { credential, password }),
//   logout: () => api.post('/auth/logout/'),
//   registerCompany: (data: any) => api.post('/auth/register-company/', data),
//   changePassword: (data: any) => api.post('/auth/change-password/', data),
//   getCurrentUser: () => api.get('/auth/me/'),

//   // Organizations
//   getOrganizations: () => api.get('/organizations/'),
//   getOrganization: (id: string) => api.get(`/organizations/${id}/`),
//   createOrganization: (data: any) => api.post('/organizations/', data),
//   updateOrganization: (id: string, data: any) => api.patch(`/organizations/${id}/`, data),

//   // Users
//   getUsers: (params?: any) => api.get('/users/', { params }),
//   getUser: (id: string) => api.get(`/users/${id}/`),
//   createUser: (data: any) => api.post('/users/', data),
//   updateUser: (id: string, data: any) => api.patch(`/users/${id}/`, data),

//   // Employees
//   getEmployees: (params?: any) => api.get('/employees/', { params }),
//   getEmployee: (id: string) => api.get(`/employees/${id}/`),
//   getActiveEmployees: () => api.get('/employees/active/'),
//   createEmployee: (data: any) => api.post('/employees/', data),
//   updateEmployee: (id: string, data: any) => api.patch(`/employees/${id}/`, data),
//   updateEmployeeStatus: (id: string, status: string) =>
//     api.post(`/employees/${id}/update_status/`, { status }),

//   // Departments
//   getDepartments: (params?: any) => api.get('/departments/', { params }),
//   getDepartment: (id: string) => api.get(`/departments/${id}/`),
//   createDepartment: (data: any) => api.post('/departments/', data),
//   updateDepartment: (id: string, data: any) => api.patch(`/departments/${id}/`, data),

//   // Designations
//   getDesignations: (params?: any) => api.get('/designations/', { params }),
//   getDesignation: (id: string) => api.get(`/designations/${id}/`),
//   createDesignation: (data: any) => api.post('/designations/', data),
//   updateDesignation: (id: string, data: any) => api.patch(`/designations/${id}/`, data),

//   // Leave Types
//   getLeaveTypes: () => api.get('/leave-types/'),
//   getLeaveType: (id: string) => api.get(`/leave-types/${id}/`),
//   createLeaveType: (data: any) => api.post('/leave-types/', data),
//   updateLeaveType: (id: string, data: any) => api.patch(`/leave-types/${id}/`, data),

//   // Leave Balances
//   getLeaveBalances: (params?: any) => api.get('/leave-balances/', { params }),
//   getMyLeaveBalance: (year?: number) =>
//     api.get('/leave-balances/my_balance/', { params: { year } }),

//   // Leave Requests
//   getLeaveRequests: (params?: any) => api.get('/leave-requests/', { params }),
//   getLeaveRequest: (id: string) => api.get(`/leave-requests/${id}/`),
//   createLeaveRequest: (data: any) => api.post('/leave-requests/', data),
//   approveLeaveRequest: (id: string) => api.post(`/leave-requests/${id}/approve/`),
//   rejectLeaveRequest: (id: string, reason: string) =>
//     api.post(`/leave-requests/${id}/reject/`, { reason }),

//   // Attendance
//   getAttendance: (params?: any) => api.get('/attendance/', { params }),
//   createAttendance: (data: any) => api.post('/attendance/', data),
//   bulkImportAttendance: (records: any[]) =>
//     api.post('/attendance/bulk_import/', { records }),

//   // Salary Slips
//   getSalarySlips: (params?: any) => api.get('/salary-slips/', { params }),
//   getSalarySlip: (id: string) => api.get(`/salary-slips/${id}/`),
//   getMySalarySlips: () => api.get('/salary-slips/my_slips/'),
//   createSalarySlip: (data: any) => api.post('/salary-slips/', data),

//   // Payroll Rules
//   getPayrollRules: (params?: any) => api.get('/payroll-rules/', { params }),
//   getPayrollRule: (id: string) => api.get(`/payroll-rules/${id}/`),
//   createPayrollRule: (data: any) => api.post('/payroll-rules/', data),

//   // Job Postings
//   getJobPostings: (params?: any) => api.get('/job-postings/', { params }),
//   getJobPosting: (id: string) => api.get(`/job-postings/${id}/`),
//   getActiveJobPostings: () => api.get('/job-postings/active/'),
//   createJobPosting: (data: any) => api.post('/job-postings/', data),
//   updateJobPosting: (id: string, data: any) =>
//     api.patch(`/job-postings/${id}/`, data),

//   // Candidates
//   getCandidates: (params?: any) => api.get('/candidates/', { params }),
//   getCandidate: (id: string) => api.get(`/candidates/${id}/`),
//   createCandidate: (data: any) => api.post('/candidates/', data),
//   updateCandidateStatus: (id: string, status: string) =>
//     api.post(`/candidates/${id}/change_status/`, { status }),

//   // Training Programs
//   getTrainingPrograms: (params?: any) => api.get('/training-programs/', { params }),
//   getTrainingProgram: (id: string) => api.get(`/training-programs/${id}/`),
//   createTrainingProgram: (data: any) => api.post('/training-programs/', data),

//   // Training Enrollments
//   getTrainingEnrollments: (params?: any) => api.get('/training-enrollments/', { params }),
//   getMyTrainingEnrollments: () => api.get('/training-enrollments/my_enrollments/'),
//   createTrainingEnrollment: (data: any) => api.post('/training-enrollments/', data),
// }
