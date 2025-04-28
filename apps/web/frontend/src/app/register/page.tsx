'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Register() {
  const [email,setEmail] = useState('');
  const [pw,setPw]       = useState('');

  async function handleRegister() {
    await fetch('/api/auth/register', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password: pw })
    });
    await signIn('credentials',{ email, password: pw, callbackUrl:'/' });
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <input className="border p-2 w-full" placeholder="Email"
             value={email} onChange={e=>setEmail(e.target.value)}/>
      <input className="border p-2 w-full" placeholder="Password" type="password"
             value={pw} onChange={e=>setPw(e.target.value)}/>
      <button onClick={handleRegister}
              className="w-full bg-green-600 text-white py-2 rounded">
        Create account
      </button>
    </div>
  );
}
