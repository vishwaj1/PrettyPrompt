'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const [email,setEmail] = useState('');
  const [pw,setPw]       = useState('');

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <button
        onClick={()=>signIn('google',{ callbackUrl:'/' })}
        className="w-full bg-red-600 text-white py-2 rounded"
      >Sign in with Google</button>

      <hr/>

      <input className="border p-2 w-full" placeholder="Email"
             value={email} onChange={e=>setEmail(e.target.value)}/>
      <input className="border p-2 w-full" placeholder="Password" type="password"
             value={pw} onChange={e=>setPw(e.target.value)}/>
      <button
        className="w-full bg-blue-600 text-white py-2 rounded"
        onClick={()=>signIn('credentials',{ email, password:pw, callbackUrl:'/' })}
      >Sign in</button>

      <p className="text-sm text-center">
        No account? <a href="/register" className="underline">Register</a>
      </p>
    </div>
  );
}
