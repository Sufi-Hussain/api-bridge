// 'use client'

// import { useState } from 'react'
// // import { useRouter } from 'next/navigation'
// import { Link, createFileRoute } from "@tanstack/react-router";
// import { Button } from '@/components/ui/button'
// import { useAuthStore } from '@/stores/auth.store'
// import api from '@/lib/api'

// export default function LoginPage() {
//   const router = useRouter()
//   const { login, dashboardRoute, isLoading: authLoading, error: authError } = useAuthStore()
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [formData, setFormData] = useState({
//     credential: '',
//     password: '',
//     organization_id: '',
//   })

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     setIsLoading(true)

//     try {
//       await login(formData.credential, formData.password, formData.organization_id || undefined)
//       // Redirect to role-based dashboard route
//       router.push(dashboardRoute)
//     } catch (err: any) {
//       setError(err.message || 'Login failed. Please try again.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">HireChamps</h1>
//           <p className="text-gray-600 mt-2">HR Management Platform</p>
//         </div>

//         <div className="bg-white rounded-lg shadow-lg p-8">
//           <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sign In</h2>

//           {error && (
//             <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label htmlFor="credential" className="block text-sm font-medium text-gray-700 mb-1">
//                 Email, Username, or Employee ID
//               </label>
//               <input
//                 id="credential"
//                 name="credential"
//                 type="text"
//                 required
//                 value={formData.credential}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                 placeholder="you@example.com or EMP001"
//               />
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 required
//                 value={formData.password}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                 placeholder="••••••••"
//               />
//             </div>

//             <Button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
//             >
//               {isLoading ? 'Signing in...' : 'Sign In'}
//             </Button>
//           </form>

//           <div className="mt-6 border-t border-gray-200 pt-6">
//             <p className="text-sm text-gray-600 text-center">
//               Don&apos;t have an account?{' '}
//               <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
//                 Sign up
//               </Link>
//             </p>
//           </div>
//         </div>

//         <p className="text-center text-sm text-gray-500 mt-6">
//           Demo credentials: demo@example.com / demo123
//         </p>
//       </div>
//     </div>
//   )
// }
