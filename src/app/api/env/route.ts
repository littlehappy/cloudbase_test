import { NextResponse } from 'next/server';

/**
 * GET /api/env — 以 JSON 返回服务端环境变量
 * 仅返回非系统环境变量，方便查看注入效果
 */
export async function GET() {
  const envVars: Record<string, string | undefined> = {};

  Object.keys(process.env)
    .filter((k) => !k.startsWith('npm_') && !k.startsWith('__') && k !== 'PATH')
    .sort()
    .forEach((key) => {
      envVars[key] = process.env[key];
    });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    message: 'CloudBase 环境变量注入验证',
    envCount: Object.keys(envVars).length,
    envVars,
  });
}
