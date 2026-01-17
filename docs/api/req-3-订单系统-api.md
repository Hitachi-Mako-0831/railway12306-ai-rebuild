# API Contract for REQ-3 - 订单系统

> Auto-generated contract based on requirement ID mapping.

## REQ-3-1 订单确认页

**Description**: 用户从车票查询页点击“预订”后进入此页面。 核心功能： 1. 展示所选车次详细信息（日期、车次、起止站、时刻）。 2. 提供乘客选择器，支持从常用联系人中勾选或新增乘客。 3. 席别与票种选择，实时计...

### API Specification

- **Method**: `POST`
- **Endpoint**: `/api/v1/orders/create`
- **Summary**: 创建订单 (Create Order)
- **Request Model**: `OrderCreate`
- **Response Model**: `Response[OrderResponse]`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-3-1-1 车次信息展示

**Description**: 展示车次号（G1234）、出发/到达站、日期（2023-12-12）、出发/到达时间及历时。数据只读，不可修改。...

---

### REQ-3-1-2 乘客选择

**Description**: 展示当前用户的常用联系人列表（复选框）。支持姓名搜索过滤。勾选后自动添加到下方的票种/席别选择列表。...

---

### REQ-3-1-3 票种选择

**Description**: 针对每一位已选乘客，提供下拉框选择票种：成人票、学生票、儿童票、残疾军人票。默认选中成人票。...

---

### REQ-3-1-4 席别选择

**Description**: 针对每一位已选乘客，提供下拉框选择席别（二等座、一等座等）。默认选中查询页预选的席别。...

---

### REQ-3-1-5 提交订单按钮

**Description**: 位于页面底部。点击触发表单校验（人数、联系方式等），校验通过后发送 Create Order 请求。...

---

## REQ-3-2 订单详情页

**Description**: 展示单个订单的完整信息。 功能点： 1. 订单状态栏：显示订单号、下单时间、当前状态。 2. 订单跟踪：时间轴展示创建、支付、退票等关键节点。 3. 详细信息：车次时刻、乘客列表（含席位号）、票价明细...

### API Specification

- **Method**: `GET`
- **Endpoint**: `/api/v1/orders/{order_identifier}`
- **Summary**: 订单详情 (Get Order Detail)
- **Response Model**: `Response[OrderDetailResponse]`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-3-2-1 订单编号展示

**Description**: 显示22位订单号（如 202312120001...）和订票日期。...

---

### REQ-3-2-2 订单状态展示

**Description**: 根据后端状态显示：待支付、已支付、已取消、已退票、部分退票。...

---

### REQ-3-2-3 车次详细信息

**Description**: 展示出发/到达站、车次、发车/到达时间。类似车票的样式布局。...

---

### REQ-3-2-4 乘客列表

**Description**: 列表展示该订单下的所有乘客。字段：姓名、证件类型/号码（脱敏）、票种、席别、车厢/座位号、票价、状态（已支付/已退票）。...

---

### REQ-3-2-5 价格明细

**Description**: 展示订单总价，以及各乘客的分项价格。...

---

### REQ-3-2-6 订单时间线

**Description**: 以时间轴形式展示订单操作记录：[2023-12-12 10:00] 订单创建 -> [2023-12-12 10:05] 支付成功。...

---

## REQ-3-3 订单支付

**Description**: 用户在订单创建成功后，或在“未完成订单”列表中点击“支付”。 目前为模拟支付：点击确认即视为支付成功。 包含 45 分钟倒计时检查。...

### API Specification

- **Method**: `POST`
- **Endpoint**: `/api/v1/orders/{order_id}/pay`
- **Summary**: 订单支付 (Pay Order)
- **Response Model**: `Response`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-3-3-1 支付倒计时

**Description**: 显示剩余支付时间（如 44:59）。倒计时结束时自动刷新状态为已取消。...

---

### REQ-3-3-2 支付按钮

**Description**: 触发支付流程。...

---

### REQ-3-3-3 支付确认弹窗

**Description**: 模拟银行/第三方支付界面。包含金额确认。...

---

### REQ-3-3-4 支付成功页

**Description**: 支付完成后展示。显示“交易已成功”，展示订单号、乘车温馨提示、二维码等。...

---

## REQ-3-4 取消订单

**Description**: 针对“待支付”状态的订单。 用户主动取消后，释放锁定的座位，订单状态变为“已取消”。...

### API Specification

- **Method**: `POST`
- **Endpoint**: `/api/v1/orders/{order_id}/cancel`
- **Summary**: 取消订单 (Cancel Order)
- **Response Model**: `Response`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-3-4-1 取消按钮

**Description**: 仅在 OrderStatus.PENDING 状态下可见。...

---

### REQ-3-4-2 取消确认弹窗

**Description**: 防止误操作，提示“您确定要取消该订单吗？取消后座位将不予保留。”...

---

## REQ-3-5 退票功能

**Description**: 针对“已支付”状态的订单。支持部分退票（选择特定乘客）或整单退票。 退票后座位释放为“可售”，退款金额按规则计算（当前模拟扣除 5% 手续费）。...

### API Specification

- **Method**: `POST`
- **Endpoint**: `/api/v1/orders/{order_id}/refund`
- **Summary**: 退票 (Refund Order)
- **Request Model**: `RefundRequest`
- **Response Model**: `Response`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-3-5-1 退票按钮

**Description**: 仅在 OrderStatus.PAID 或 PARTIALLY_REFUNDED 状态下可见。...

---

### REQ-3-5-2 退票乘客选择

**Description**: 弹窗列出可退票的乘客（未退票状态）。用户勾选需要退票的人员。...

---

### REQ-3-5-3 退票手续费展示

**Description**: 在确认退票前，根据退票规则（如开车前时间）预计算并展示手续费。...

---

### REQ-3-5-4 退款金额展示

**Description**: 退票成功后，显示实际退款金额。...

---

### REQ-3-5-5 退票确认弹窗

**Description**: 最终确认操作，提示不可撤销。...

---

## REQ-3-6 订单列表页

**Description**: 个人中心的订单管理入口。 提供多维度筛选和分类查看功能。...

### API Specification

- **Method**: `GET`
- **Endpoint**: `/api/v1/orders`
- **Summary**: 订单列表 (Get Orders)
- **Response Model**: `Response[List[OrderResponse]]`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-3-6-1 订单筛选Tab

**Description**: 分为：未完成订单（待支付）、未出行订单（已支付但未发车）、历史订单（已完成/已退票/已取消）。...

---

### REQ-3-6-2 订单卡片

**Description**: 展示单条订单摘要。支持折叠/展开详细信息。显示：车次（北京南->上海虹桥）、发车时间、总价、状态。...

---

### REQ-3-6-3 订单操作按钮

**Description**: 根据订单状态动态显示按钮组合： - 待支付：支付、取消 - 已支付：改签、变更到站、退票、详情 - 已完成/退票：详情...

---

### REQ-3-6-4 空状态展示

**Description**: 当查询结果为空时，展示“暂无订单”提示及图标。...

---

