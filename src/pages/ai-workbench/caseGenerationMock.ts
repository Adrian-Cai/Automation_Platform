export type CasePriority = 'P0' | 'P1' | 'P2';
export type CaseType = '功能测试' | '异常测试' | '边界值' | '并发测试';
export type CaseModule = '领取中心' | '库存扣减' | '领取资格' | '库存回流' | '异常提示';

export interface GeneratedTestCase {
  id: string;
  caseNo: string;
  module: CaseModule;
  title: string;
  priority: CasePriority;
  caseType: CaseType;
  automated: boolean;
  precondition: string;
  steps: string;
  testData: string;
  expectedResult: string;
  remark?: string;
  updateTime: string;
}

export const CASE_MODULES: CaseModule[] = ['领取中心', '库存扣减', '领取资格', '库存回流', '异常提示'];
export const CASE_TYPES: CaseType[] = ['功能测试', '异常测试', '边界值', '并发测试'];
export const CASE_PRIORITIES: CasePriority[] = ['P0', 'P1', 'P2'];

export const BASE_TEST_CASES: GeneratedTestCase[] = [
  {
    id: 'case-001',
    caseNo: 'TC-20240520-0001',
    module: '领取中心',
    title: '验证库存充足时用户领取成功',
    priority: 'P0',
    caseType: '功能测试',
    automated: true,
    precondition: '活动处于进行中；用户已登录；可领取库存数量大于 0。',
    steps: '1. 进入活动领取页面；\n2. 点击「立即领取」按钮；\n3. 观察领取请求和页面提示；\n4. 查询领取记录。',
    testData: '活动ID：ACT-20240520-001；用户ID：user_10001；可领取库存：100。',
    expectedResult: '系统提示“领取成功”；库存数量减少 1；订单/领取记录中有该条记录。',
    remark: '覆盖领取链路主流程。',
    updateTime: '2024-05-20 14:30',
  },
  {
    id: 'case-002',
    caseNo: 'TC-20240520-0002',
    module: '领取中心',
    title: '验证库存不足时领取失败',
    priority: 'P0',
    caseType: '异常测试',
    automated: false,
    precondition: '活动处于进行中；用户已登录；活动库存为 0。',
    steps: '1. 进入活动领取页面；\n2. 点击「立即领取」按钮；\n3. 查看页面提示和接口返回。',
    testData: '活动ID：ACT-20240520-002；库存：0。',
    expectedResult: '领取失败；页面展示库存不足提示；不生成领取记录。',
    remark: '需要校验前后端提示一致。',
    updateTime: '2024-05-20 14:28',
  },
  {
    id: 'case-003',
    caseNo: 'TC-20240520-0003',
    module: '领取资格',
    title: '验证活动未开始时不可领取',
    priority: 'P1',
    caseType: '功能测试',
    automated: false,
    precondition: '活动开始时间晚于当前时间；用户满足其他领取条件。',
    steps: '1. 打开未开始活动页面；\n2. 查看领取按钮状态；\n3. 尝试触发领取接口。',
    testData: '活动开始时间：当前时间 + 1 天。',
    expectedResult: '领取按钮不可点击；接口返回活动未开始；不扣减库存。',
    remark: '覆盖时间窗前置校验。',
    updateTime: '2024-05-20 14:27',
  },
  {
    id: 'case-004',
    caseNo: 'TC-20240520-0004',
    module: '领取资格',
    title: '验证活动已结束时不可领取',
    priority: 'P1',
    caseType: '功能测试',
    automated: false,
    precondition: '活动结束时间早于当前时间；活动存在剩余库存。',
    steps: '1. 打开已结束活动页面；\n2. 查看领取按钮状态；\n3. 尝试调用领取接口。',
    testData: '活动结束时间：当前时间 - 1 小时。',
    expectedResult: '领取入口置灰；接口返回活动已结束；库存保持不变。',
    remark: '防止结束活动继续发放。',
    updateTime: '2024-05-20 14:26',
  },
  {
    id: 'case-005',
    caseNo: 'TC-20240520-0005',
    module: '库存扣减',
    title: '验证 600 用户并发领取 30 份库存不能超发',
    priority: 'P0',
    caseType: '并发测试',
    automated: true,
    precondition: '活动处于进行中；库存总量为 30；准备 600 个满足资格的用户。',
    steps: '1. 使用压测脚本同时发起 600 个领取请求；\n2. 统计成功与失败数量；\n3. 查询最终库存和领取记录。',
    testData: '并发用户数：600；库存：30；压测窗口：10 秒。',
    expectedResult: '成功领取数量不超过 30；库存不为负；失败用户收到明确提示。',
    remark: '重点关注分布式锁和幂等逻辑。',
    updateTime: '2024-05-20 14:25',
  },
  {
    id: 'case-006',
    caseNo: 'TC-20240520-0006',
    module: '领取资格',
    title: '验证同一用户重复领取被拦截',
    priority: 'P1',
    caseType: '异常测试',
    automated: true,
    precondition: '活动限制每个用户只能领取一次；用户已成功领取过。',
    steps: '1. 使用已领取用户再次进入页面；\n2. 再次点击领取按钮；\n3. 查询该用户领取记录。',
    testData: '用户ID：user_repeat_001；领取次数限制：1。',
    expectedResult: '二次领取失败；提示不可重复领取；领取记录仍只有一条。',
    remark: '需校验接口幂等。',
    updateTime: '2024-05-20 14:24',
  },
  {
    id: 'case-007',
    caseNo: 'TC-20240520-0007',
    module: '异常提示',
    title: '验证领取数量超出限额时提示错误',
    priority: 'P1',
    caseType: '边界值',
    automated: false,
    precondition: '活动单次领取上限为 2；用户请求领取数量大于上限。',
    steps: '1. 构造领取数量为 3 的请求；\n2. 提交领取；\n3. 查看提示和库存变化。',
    testData: '单次上限：2；请求数量：3。',
    expectedResult: '系统提示领取数量超出限额；库存不扣减；不生成记录。',
    remark: '覆盖参数边界校验。',
    updateTime: '2024-05-20 14:23',
  },
  {
    id: 'case-008',
    caseNo: 'TC-20240520-0008',
    module: '库存扣减',
    title: '验证领取成功后库存正确扣减',
    priority: 'P0',
    caseType: '功能测试',
    automated: true,
    precondition: '活动库存为 10；用户满足领取资格且未领取过。',
    steps: '1. 记录领取前库存；\n2. 用户领取 1 份权益；\n3. 查询领取后库存。',
    testData: '初始库存：10；领取数量：1。',
    expectedResult: '领取成功后库存变为 9；库存流水记录正确。',
    remark: '需要核对缓存和数据库库存一致。',
    updateTime: '2024-05-20 14:22',
  },
  {
    id: 'case-009',
    caseNo: 'TC-20240520-0009',
    module: '库存回流',
    title: '验证领取成功但记录生成失败时库存回滚',
    priority: 'P0',
    caseType: '异常测试',
    automated: true,
    precondition: '活动库存充足；模拟领取记录写入服务失败。',
    steps: '1. 开启记录写入失败开关；\n2. 发起领取请求；\n3. 查询库存和记录表。',
    testData: '故障注入：record-service-failed。',
    expectedResult: '领取事务失败；库存回滚到领取前；不产生脏记录。',
    remark: '覆盖事务一致性。',
    updateTime: '2024-05-20 14:21',
  },
  {
    id: 'case-010',
    caseNo: 'TC-20240520-0010',
    module: '库存回流',
    title: '验证未核销订单超时后库存回流',
    priority: 'P1',
    caseType: '功能测试',
    automated: false,
    precondition: '用户领取成功但未核销；系统配置超时回流规则。',
    steps: '1. 创建未核销领取记录；\n2. 将记录时间调整为超时；\n3. 触发库存回流任务。',
    testData: '超时时间：30 分钟；领取数量：1。',
    expectedResult: '记录状态变为已超时；库存增加 1；回流流水可追踪。',
    remark: '适合接入定时任务验证。',
    updateTime: '2024-05-20 14:20',
  },
  {
    id: 'case-011',
    caseNo: 'TC-20240520-0011',
    module: '库存扣减',
    title: '验证接口超时时不会重复扣减库存',
    priority: 'P0',
    caseType: '异常测试',
    automated: true,
    precondition: '活动库存充足；客户端请求超时后会重试。',
    steps: '1. 模拟首次领取接口超时；\n2. 使用同一幂等号重试请求；\n3. 查询库存和领取记录。',
    testData: '幂等号：idem-20240520-001；重试次数：2。',
    expectedResult: '同一幂等号只扣减一次库存；只生成一条领取记录。',
    remark: '重点验证幂等键。',
    updateTime: '2024-05-20 14:19',
  },
  {
    id: 'case-012',
    caseNo: 'TC-20240520-0012',
    module: '领取资格',
    title: '验证用户不满足领取资格时按钮不可点击',
    priority: 'P1',
    caseType: '功能测试',
    automated: false,
    precondition: '用户未满足会员等级或地区规则；活动仍在进行中。',
    steps: '1. 使用不满足资格用户进入页面；\n2. 查看按钮状态和资格说明；\n3. 尝试直接调用领取接口。',
    testData: '用户等级：普通；要求等级：VIP。',
    expectedResult: '领取按钮不可点击；展示资格不足原因；接口拒绝领取。',
    remark: '前后端都必须校验资格。',
    updateTime: '2024-05-20 14:18',
  },
];

function padCaseNo(index: number): string {
  return `TC-20240520-${String(index).padStart(4, '0')}`;
}

export function createMockTestCases(total = 86): GeneratedTestCase[] {
  return Array.from({ length: total }, (_, index) => {
    const base = BASE_TEST_CASES[index % BASE_TEST_CASES.length];
    const serial = index + 1;
    const copyRound = Math.floor(index / BASE_TEST_CASES.length);
    return {
      ...base,
      id: `case-${String(serial).padStart(3, '0')}`,
      caseNo: padCaseNo(serial),
      title: copyRound === 0 ? base.title : `${base.title}（扩展场景 ${copyRound + 1}）`,
      updateTime: base.updateTime,
    };
  });
}
