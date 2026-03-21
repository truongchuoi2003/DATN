const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const countArg = args.find((arg) => arg.startsWith('--count='));
  const count = countArg ? Number(countArg.split('=')[1]) : 40;

  return {
    count: Number.isFinite(count) && count > 0 ? count : 40,
  };
}

function runNodeScript(scriptRelativePath, args = []) {
  const scriptPath = path.join(ROOT, scriptRelativePath);

  console.log(`\n🚀 Chạy: node ${scriptRelativePath} ${args.join(' ')}`.trim());

  const result = spawnSync('node', [scriptPath, ...args], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    throw new Error(`Script thất bại: ${scriptRelativePath}`);
  }
}

function main() {
  const { count } = parseArgs();

  console.log('='.repeat(70));
  console.log('🔁 BẮT ĐẦU REBUILD TOÀN BỘ DỮ LIỆU DEMO');
  console.log(`📦 Số lượng job seed: ${count}`);
  console.log('='.repeat(70));

  runNodeScript('scripts/cleanupOrphanApplications.js', ['--apply']);
  runNodeScript('scripts/seedPendingEmployers.js', ['--reset']);
  runNodeScript('scripts/seedEmployers.js', ['--reset']);
  runNodeScript('scripts/createAdmin.js');
  runNodeScript('scripts/seedStudents.js', ['--reset']);
  runNodeScript('scripts/seedJobs.js', ['--reset']);
  runNodeScript('scripts/seedInteractions.js', ['--reset']);
  runNodeScript('scripts/seedApplications.js', ['--reset']);
  runNodeScript('scripts/cleanupOrphanApplications.js');
  runNodeScript('scripts/seedReports.js', ['--reset']);

  console.log('\n' + '='.repeat(70));
  console.log('✅ HOÀN TẤT REBUILD DEMO');
  console.log('📌 Employer sẽ chỉ thấy applicant thật, không còn applicant rỗng.');
  console.log('📌 Student chỉ apply vài job phù hợp trong nhóm recommend mạnh.');
  console.log('='.repeat(70));
}

try {
  main();
} catch (error) {
  console.error('\n❌ Seed demo reset thất bại:', error.message);
  process.exit(1);
}