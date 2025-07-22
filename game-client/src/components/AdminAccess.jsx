import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { ArrowLeft, Lock, AlertTriangle } from 'lucide-react'

const AdminAccess = ({ onAccess, onBack }) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simple password check (in production, this would be server-side)
    setTimeout(() => {
      if (password === 'skyward_admin_2024') {
        onAccess()
      } else {
        setError('Invalid password. Please try again.')
        setPassword('')
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/20 backdrop-blur-sm border-purple-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-white">Admin Access</CardTitle>
          <p className="text-purple-300 text-sm">Enter admin password to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/20 border-purple-500/20 text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 p-3 rounded bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="flex-1 border-purple-500/20 text-white hover:bg-purple-500/20"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading || !password}
              >
                {isLoading ? 'Checking...' : 'Access Admin Panel'}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-400 text-xs text-center">
              <strong>Demo Password:</strong> skyward_admin_2024
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminAccess 