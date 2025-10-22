export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Sora Studio
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Video Generation Platform
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Day 1 Setup Complete - Ready for Development
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Setup Status
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
              <p className="text-gray-700">Next.js 15 with TypeScript configured</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
              <p className="text-gray-700">Tailwind CSS configured</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
              <p className="text-gray-700">API client configured</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
              <p className="text-gray-700">TypeScript types defined</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm">→</div>
              <p className="text-gray-700">Ready for Day 2: Core API Integration</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Install dependencies: <code className="bg-blue-100 px-1 rounded">npm install</code></li>
              <li>Configure environment variables</li>
              <li>Set up database schema</li>
              <li>Test API connections</li>
              <li>Start development: <code className="bg-blue-100 px-1 rounded">npm run dev</code></li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
