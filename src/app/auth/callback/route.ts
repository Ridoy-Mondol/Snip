import { NextResponse } from 'next/server'
import { createClient } from "@supabase/supabase-js";
import { saveGoogleUser } from '@/utilities/fetch'
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY as string;
      const supabase = await createClient(supabaseUrl, supabaseKey)

      // Exchange the code for the session
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('Error exchanging code for session:', sessionError)
        return NextResponse.redirect(`${origin}`)
      }

      const user = sessionData?.session?.user

      if (user) {
        const { email, user_metadata } = user
        const { name, avatar_url } = user_metadata || {}

        if (email && name && avatar_url) {
          const userSaved = await saveGoogleUser({ email, name, avatar_url })

          if (userSaved) {
            return NextResponse.redirect(`${origin}/explore`)
          } else {
            console.error('Error saving user data')
            return NextResponse.redirect(`${origin}`)
          }
        } else {
          console.error('User data incomplete (email, name, avatar_url)')
          return NextResponse.redirect(`${origin}`)
        }
      } else {
        console.error('No user found in session')
        return NextResponse.redirect(`${origin}`)
      }
    } catch (error) {
      console.error('Error during session fetch:', error)
      return NextResponse.redirect(`${origin}`)
    }
  } else {
    return NextResponse.redirect(`${origin}`)
  }
}
