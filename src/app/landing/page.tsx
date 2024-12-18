import Link from 'next/link'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  // If authenticated, redirect to story form
  if (session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Create Amazing Stories with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Generate unique, personalized stories for children in seconds
          </p>
          <div className="space-x-4">
            <Link
              href="/auth/signin"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 border border-indigo-600"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 