/**
 * 首页 — 展示客户端环境变量 & 调用 API 展示服务端环境变量
 */
async function getServerEnv() {
  // 服务端直接读取环境变量
  const envKeys = Object.keys(process.env)
    .filter((k) => !k.startsWith('npm_') && !k.startsWith('__') && k !== 'PATH')
    .sort();

  return envKeys.map((key) => ({
    key,
    value: process.env[key] ?? '(未设置)',
  }));
}

export default async function HomePage() {
  const serverEnvVars = await getServerEnv();

  // 客户端可访问的 NEXT_PUBLIC_* 变量
  const publicEnvVars = Object.keys(process.env)
    .filter((k) => k.startsWith('NEXT_PUBLIC_'))
    .sort()
    .map((key) => ({
      key,
      value: process.env[key] ?? '(未设置)',
    }));

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            🚀 CloudBase 自动化部署测试
          </h1>
          <p className="text-gray-400">
            环境变量注入 & 展示 | Next.js + Tailwind
          </p>
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            服务运行中
          </div>
        </header>

        {/* 客户端环境变量 */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            📦 客户端环境变量 <span className="text-sm text-gray-500">(NEXT_PUBLIC_*)</span>
          </h2>
          {publicEnvVars.length === 0 ? (
            <div className="text-gray-500 text-sm bg-gray-800/50 rounded-lg p-4">
              ⚠️ 未设置任何 NEXT_PUBLIC_* 环境变量
            </div>
          ) : (
            <div className="space-y-2">
              {publicEnvVars.map(({ key, value }) => (
                <div
                  key={key}
                  className="flex items-start gap-4 bg-gray-800/50 rounded-lg p-3"
                >
                  <code className="text-yellow-300 font-mono text-sm shrink-0 min-w-[200px]">
                    {key}
                  </code>
                  <code className="text-green-300 font-mono text-sm break-all">
                    {value}
                  </code>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 服务端环境变量 */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">
            🔐 服务端环境变量 <span className="text-sm text-gray-500">(全部 process.env)</span>
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {serverEnvVars.map(({ key, value }) => (
              <div
                key={key}
                className="flex items-start gap-4 bg-gray-800/50 rounded-lg p-3"
              >
                <code className="text-pink-300 font-mono text-sm shrink-0 min-w-[200px]">
                  {key}
                </code>
                <code className="text-teal-300 font-mono text-sm break-all">
                  {value}
                </code>
              </div>
            ))}
          </div>
        </section>

        {/* API 测试 */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-400">
            🔗 API 测试
          </h2>
          <a
            href="/api/env"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-white transition-colors"
          >
            GET /api/env →
          </a>
        </section>

        <footer className="text-center text-gray-600 text-sm pt-4 border-t border-gray-800">
          CloudBase Test · v0.1.0 · {new Date().toISOString().slice(0, 10)}
        </footer>
      </div>
    </main>
  );
}
